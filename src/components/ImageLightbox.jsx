import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Renderer, Triangle, Program, Mesh, Texture } from 'ogl';
import { gsap } from 'gsap';
import './ImageLightbox.css';

const vertexShader = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform sampler2D tCurrent;
uniform sampler2D tNext;
uniform vec2 uResolution;
uniform vec2 uCurrentSize;
uniform vec2 uNextSize;
uniform float uProgress;
uniform float uDir;
uniform float uIntensity;
uniform float uScale;
uniform float uAberration;
uniform float uDrift;
uniform float uTime;
uniform vec2 uPointer;

varying vec2 vUv;

const float PI = 3.14159265359;

float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

// Contain UV mapping: Fits entire image without cropping
vec3 sampleContain(sampler2D tex, vec2 uv, vec2 res, vec2 img, float ca, out float alpha) {
  float rA = res.x / max(res.y, 1.0);
  float iA = img.x / max(img.y, 1.0);
  vec2 s = vec2(1.0);
  if (rA > iA) {
    s.x = rA / iA;
  } else {
    s.y = iA / rA;
  }
  vec2 coords = (uv - 0.5) * s + 0.5;
  if (coords.x < 0.0 || coords.x > 1.0 || coords.y < 0.0 || coords.y > 1.0) {
    alpha = 0.0;
    return vec3(0.0);
  }
  alpha = 1.0;
  vec4 r = texture2D(tex, coords + vec2(ca, 0.0));
  vec4 g = texture2D(tex, coords);
  vec4 b = texture2D(tex, coords - vec2(ca, 0.0));
  return vec3(r.r, g.g, b.b);
}

void main() {
  float p = clamp(uProgress, 0.0, 1.0);
  float env = sin(p * PI);
  vec2 uv = vUv;

  // Gentle subtle breathing drift
  uv += vec2(sin(uTime * 0.25 + uv.y * 3.0), cos(uTime * 0.22 + uv.x * 3.0)) * uDrift * 0.005;

  // Fluid Melt Morph Distortion
  float nn = fbm(uv * uScale + uTime * 0.03);
  float warp = fbm(uv * uScale * 1.5 - uTime * 0.02);
  vec2 g = vec2(nn, warp) - 0.5;

  vec2 uvC = uv + g * uIntensity * 0.45 * p;
  vec2 uvN = uv - g * uIntensity * 0.45 * (1.0 - p);

  float m = smoothstep(nn - 0.15, nn + 0.15, p);
  float ca = uAberration * env * 0.025;

  float aC = 0.0;
  float aN = 0.0;
  vec3 colC = sampleContain(tCurrent, uvC, uResolution, uCurrentSize, ca, aC);
  vec3 colN = sampleContain(tNext, uvN, uResolution, uNextSize, ca, aN);

  vec3 col = mix(colC, colN, m);
  float alpha = mix(aC, aN, m);

  gl_FragColor = vec4(col * alpha, alpha);
}
`;

function makeFallbackTexture(gl) {
  const size = 2;
  const data = new Uint8Array(size * size * 4);
  return new Texture(gl, { image: data, width: size, height: size, generateMipmaps: false });
}

export default function ImageLightbox({
  items = [],
  initialIndex = 0,
  src,
  alt,
  onClose,
  onChangeIndex,
  actionButton,
}) {
  const galleryItems = useMemo(() => {
    return items.length > 0
      ? items
      : src ? [{ image: src, caption: alt || "" }] : [];
  }, [items, src, alt]);

  const [currentIndex, setCurrentIndex] = useState(() =>
    initialIndex >= 0 && initialIndex < galleryItems.length ? initialIndex : 0
  );

  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const programRef = useRef(null);
  const texturesRef = useRef([]);
  const sizesRef = useRef([]);
  const tweenRef = useRef(null);
  const isAnimatingRef = useRef(false);
  const total = galleryItems.length;

  // Touch swipe refs
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const touchDeltaRef = useRef({ x: 0, y: 0 });
  const doubleTapRef = useRef(null);
  const isSwiping = useRef(false);

  // Initialize WebGL Morph Engine
  useEffect(() => {
    const container = containerRef.current;
    if (!container || galleryItems.length === 0) return;

    const renderer = new Renderer({
      alpha: true,
      premultipliedAlpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio || 1, 2)
    });
    rendererRef.current = renderer;
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);

    const canvas = gl.canvas;
    canvas.className = 'morph-lightbox-canvas';
    container.innerHTML = '';
    container.appendChild(canvas);

    const geometry = new Triangle(gl);
    texturesRef.current = galleryItems.map(() => makeFallbackTexture(gl));
    sizesRef.current = galleryItems.map(() => [1, 1]);

    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        tCurrent: { value: texturesRef.current[currentIndex] },
        tNext: { value: texturesRef.current[currentIndex] },
        uResolution: { value: [1, 1] },
        uCurrentSize: { value: sizesRef.current[currentIndex] },
        uNextSize: { value: sizesRef.current[currentIndex] },
        uProgress: { value: 0 },
        uDir: { value: 1 },
        uIntensity: { value: 0.38 },
        uScale: { value: 2.2 },
        uAberration: { value: 0.35 },
        uDrift: { value: 0.25 },
        uTime: { value: 0 },
        uPointer: { value: [0.5, 0.5] }
      }
    });
    programRef.current = program;

    const mesh = new Mesh(gl, { geometry, program });

    // Load Image Textures
    galleryItems.forEach((item, idx) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = item.image || item.src;
      img.onload = () => {
        const tex = new Texture(gl, { generateMipmaps: false });
        tex.image = img;
        texturesRef.current[idx] = tex;
        sizesRef.current[idx] = [img.naturalWidth || 1, img.naturalHeight || 1];
        if (idx === currentIndex) {
          program.uniforms.tCurrent.value = tex;
          program.uniforms.uCurrentSize.value = sizesRef.current[idx];
        }
      };
    });

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const w = Math.max(rect.width, 1);
      const h = Math.max(rect.height, 1);
      renderer.setSize(w, h);
      program.uniforms.uResolution.value = [gl.canvas.width, gl.canvas.height];
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    let rafId;
    const loop = (t) => {
      program.uniforms.uTime.value = t * 0.001;
      renderer.render({ scene: mesh });
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      if (tweenRef.current) tweenRef.current.kill();
      resizeObserver.disconnect();
      texturesRef.current.forEach(tex => {
        if (tex && tex.texture) gl.deleteTexture(tex.texture);
      });
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
  }, [galleryItems]);

  // Morph to Target Index
  const morphTo = useCallback((nextIndex, dir = 1) => {
    if (isAnimatingRef.current || nextIndex === currentIndex || total < 2) return;
    const program = programRef.current;
    if (!program) return;

    isAnimatingRef.current = true;
    const curTex = texturesRef.current[currentIndex];
    const nxtTex = texturesRef.current[nextIndex];
    const curSize = sizesRef.current[currentIndex];
    const nxtSize = sizesRef.current[nextIndex];

    program.uniforms.tCurrent.value = curTex;
    program.uniforms.uCurrentSize.value = curSize;
    program.uniforms.tNext.value = nxtTex;
    program.uniforms.uNextSize.value = nxtSize;
    program.uniforms.uDir.value = dir;

    if (tweenRef.current) tweenRef.current.kill();

    tweenRef.current = gsap.fromTo(
      program.uniforms.uProgress,
      { value: 0 },
      {
        value: 1,
        duration: 1.1,
        ease: 'power3.out',
        onComplete: () => {
          program.uniforms.tCurrent.value = nxtTex;
          program.uniforms.uCurrentSize.value = nxtSize;
          program.uniforms.uProgress.value = 0;
          setCurrentIndex(nextIndex);
          onChangeIndex?.(nextIndex);
          isAnimatingRef.current = false;
        }
      }
    );
  }, [currentIndex, total, onChangeIndex]);

  const handleNext = useCallback((e) => {
    if (e) e.stopPropagation();
    if (total <= 1) return;
    const next = (currentIndex + 1) % total;
    morphTo(next, 1);
  }, [currentIndex, total, morphTo]);

  const handlePrev = useCallback((e) => {
    if (e) e.stopPropagation();
    if (total <= 1) return;
    const prev = (currentIndex - 1 + total) % total;
    morphTo(prev, -1);
  }, [currentIndex, total, morphTo]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") handleNext();
      else if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, handleNext, handlePrev]);

  // Lock scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Touch Gesture Handlers
  const onTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY, time: Date.now() };
    touchDeltaRef.current = { x: 0, y: 0 };
    isSwiping.current = true;
  };

  const onTouchMove = (e) => {
    if (!isSwiping.current || e.touches.length !== 1) return;
    const t = e.touches[0];
    touchDeltaRef.current = {
      x: t.clientX - touchStartRef.current.x,
      y: t.clientY - touchStartRef.current.y,
    };
  };

  const onTouchEnd = () => {
    if (!isSwiping.current) return;
    isSwiping.current = false;
    const { x: dx, y: dy } = touchDeltaRef.current;
    const ax = Math.abs(dx);
    const ay = Math.abs(dy);

    if (ax > 45 && ax > ay) {
      if (dx < 0) handleNext();
      else handlePrev();
      return;
    }

    if (ax < 10 && ay < 10) {
      if (doubleTapRef.current) {
        clearTimeout(doubleTapRef.current);
        doubleTapRef.current = null;
        onClose();
      } else {
        doubleTapRef.current = setTimeout(() => {
          doubleTapRef.current = null;
        }, 320);
      }
    }
  };

  const currentItem = galleryItems[currentIndex] || {};

  return (
    <div
      className="lb-overlay lb-overlay--morph"
      onClick={onClose}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      role="dialog"
      aria-modal="true"
      aria-label="Image morph gallery"
    >
      {/* Top Header */}
      <div className="lb-header">
        {total > 1 && (
          <div className="lb-counter">
            <span>{currentIndex + 1}</span>
            <span className="lb-counter-sep">/</span>
            <span>{total}</span>
          </div>
        )}
        <button
          type="button"
          className="lb-close"
          onClick={onClose}
          aria-label="Đóng"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Navigation Arrows */}
      {total > 1 && (
        <>
          <button
            type="button"
            className="lb-arrow lb-arrow--prev"
            onClick={handlePrev}
            aria-label="Ảnh trước"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            className="lb-arrow lb-arrow--next"
            onClick={handleNext}
            aria-label="Ảnh tiếp theo"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </>
      )}

      {/* MorphSlider WebGL Canvas Stage */}
      <div
        className="lb-stage lb-stage--morph"
        ref={containerRef}
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={onClose}
      />

      {/* Footer */}
      <div className="lb-footer">
        {actionButton && <div className="lb-action-wrap">{actionButton}</div>}
        {currentItem.storyText ? (
          <p className="lb-caption">{currentItem.storyText}</p>
        ) : currentItem.caption ? (
          <p className="lb-caption">{currentItem.caption}</p>
        ) : null}
        <p className="lb-hint">Vuốt hoặc dùng mũi tên để chuyển ảnh (Melt Morph) • Nhấn đúp để đóng</p>
      </div>
    </div>
  );
}
