import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import "./HomeMosaic.css";

// ─── Layout constants ───────────────────────────────────────────────────────
const CHAPTER_Z = 4000;
const VIRTUAL_W = 2800;
const VIRTUAL_H = 1800;
const TABLE_X = VIRTUAL_W * 0.42;
const TABLE_Y = VIRTUAL_H * 0.42;
const GAP = 200;

const SECTOR_OFFSETS = [
  { xr: -0.56, yr: -0.52 },
  { xr:  0.0,  yr: -0.58 },
  { xr:  0.56, yr: -0.52 },
  { xr: -0.58, yr:  0.04 },
  { xr:  0.58, yr:  0.04 },
  { xr: -0.56, yr:  0.56 },
  { xr:  0.0,  yr:  0.58 },
  { xr:  0.56, yr:  0.56 },
];

function pseudoRand(seed) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function hashStr(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function buildLayout(items) {
  // Group by category
  const seriesIds = [...new Set(items.map((it) => it.category))];

  const seriesPositions = new Map();
  for (const sid of seriesIds) {
    const seriesItems = items.filter((it) => it.category === sid).slice(0, 8);
    const placed = [];

    for (let idx = 0; idx < seriesItems.length; idx++) {
      const seed = hashStr(sid + "::" + idx);
      const w_px = 180 + pseudoRand(seed) * 200;
      const h_px = w_px * (1.2 + pseudoRand(seed + 1) * 0.6);

      const sector = SECTOR_OFFSETS[idx % SECTOR_OFFSETS.length];
      const scx = sector.xr * TABLE_X;
      const scy = sector.yr * TABLE_Y;

      let bx = scx, by = scy, found = false;

      for (let att = 0; att < 400 && !found; att++) {
        const ox = (-0.5 + pseudoRand(seed + att * 13 + 99)) * TABLE_X * 0.44;
        const oy = (-0.5 + pseudoRand(seed + att * 17 + 199)) * TABLE_Y * 0.44;
        const tx = Math.max(-TABLE_X, Math.min(TABLE_X, scx + ox));
        const ty = Math.max(-TABLE_Y, Math.min(TABLE_Y, scy + oy));

        let col = false;
        for (const box of placed) {
          if (
            !(
              tx - w_px / 2 - GAP > box.x + box.w / 2 ||
              tx + w_px / 2 + GAP < box.x - box.w / 2 ||
              ty - h_px / 2 - GAP > box.y + box.h / 2 ||
              ty + h_px / 2 + GAP < box.y - box.h / 2
            )
          ) { col = true; break; }
        }

        if (!col) { bx = tx; by = ty; found = true; }
      }

      placed.push({ x: bx, y: by, w: w_px, h: h_px });
    }
    seriesPositions.set(sid, placed);
  }

  // Build flat layout with z
  const layout = [];
  for (const it of items) {
    const sIdx = seriesIds.indexOf(it.category);
    const seriesItems = items.filter((x) => x.category === it.category).slice(0, 8);
    const iIdx = seriesItems.findIndex((x) => x.id === it.id);
    if (iIdx < 0 || iIdx >= 8) continue;

    const pos = (seriesPositions.get(it.category) ?? [])[iIdx] ?? { x: 0, y: 0, w: 220, h: 280 };
    const z = -(sIdx * CHAPTER_Z);
    const baseSeed = hashStr(it.id);
    const lagSpeed = 0.05 + pseudoRand(baseSeed + 99) * 0.08;

    layout.push({
      item: it,
      x: (pos.x / VIRTUAL_W) * 100,
      y: (pos.y / VIRTUAL_H) * 100,
      z,
      width: (pos.w / VIRTUAL_W) * 100,
      sIdx,
      lagSpeed,
    });
  }

  return { layout, seriesIds };
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function HomeMosaic({ items = [], onItemClick }) {
  const { layout, seriesIds } = useRef(buildLayout(items)).current;

  const [chapterIdx, setChapterIdx] = useState(0);
  const [displayTitle, setDisplayTitle] = useState(
    items.find((it) => it.category === seriesIds[0])?.categoryLabel ?? ""
  );

  const baseCamRef = useRef(null);
  const maskedCamRef = useRef(null);
  const clipRectRef = useRef(null);
  const cursorFrameRef = useRef(null);
  const titleRef = useRef(null);

  const baseImgsRef = useRef([]);
  const maskedImgsRef = useRef([]);

  const layoutPxRef = useRef([]);
  const cameraZRef = useRef({ z: 0 });
  const maskSizeRef = useRef({ size: 380 });
  const lerpRef = useRef({
    mouseX: typeof window !== "undefined" ? window.innerWidth / 2 : 0,
    mouseY: typeof window !== "undefined" ? window.innerHeight / 2 : 0,
    maskX: typeof window !== "undefined" ? window.innerWidth / 2 : 0,
    maskY: typeof window !== "undefined" ? window.innerHeight / 2 : 0,
    camX: 0,
    camY: 0,
  });
  const chapterIdxRef = useRef(0);
  const rafRef = useRef(null);
  const isVisibleRef = useRef(true);

  // ── Scramble title ───────────────────────────────────────────────────────
  const scrambleTitle = useCallback((text) => {
    const glyphs = "0123456789@!#$%&?*+=-_[]{}|";
    let frame = 0;
    const queue = text.split("").map((to) => ({
      to,
      start: Math.floor(Math.random() * 12),
      end: Math.floor(Math.random() * 20) + 12,
      char: undefined,
    }));

    let rafId;
    const update = () => {
      let out = "", done = 0;
      for (const item of queue) {
        if (frame >= item.end) { out += item.to; done++; }
        else if (frame >= item.start) {
          if (!item.char || Math.random() < 0.28)
            item.char = glyphs[Math.floor(Math.random() * glyphs.length)];
          out += item.char;
        } else { out += " "; }
      }
      setDisplayTitle(out);
      if (done < queue.length) { frame++; rafId = requestAnimationFrame(update); }
    };
    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // ── Init layout px ───────────────────────────────────────────────────────
  const recomputeLayout = useCallback(() => {
    if (typeof window === "undefined") return;
    const W = window.innerWidth, H = window.innerHeight;
    const isMob = W <= 800;
    const sx = isMob ? 0.62 : 1.0;
    const sy = isMob ? 0.62 : 1.0;
    layoutPxRef.current = layout.map((l) => ({
      x: ((l.x * sx) / 100) * W,
      y: ((l.y * sy) / 100) * H,
      z: l.z,
      width: (l.width / 100) * W,
      currentCamZ: cameraZRef.current.z,
    }));
  }, [layout]);

  // ── Navigate to chapter ──────────────────────────────────────────────────
  const goToChapter = useCallback((idx) => {
    const clamped = Math.max(0, Math.min(seriesIds.length - 1, idx));
    chapterIdxRef.current = clamped;
    setChapterIdx(clamped);

    const label = items.find((it) => it.category === seriesIds[clamped])?.categoryLabel ?? "";
    scrambleTitle(label);

    gsap.to(cameraZRef.current, {
      z: clamped * CHAPTER_Z,
      duration: 1.4,
      ease: "power3.inOut",
    });
  }, [seriesIds, items, scrambleTitle]);

  // ── RAF tick ──────────────────────────────────────────────────────────────
  useEffect(() => {
    recomputeLayout();

    const onResize = () => recomputeLayout();
    window.addEventListener("resize", onResize);

    // Intro mask open
    gsap.to(maskSizeRef.current, { size: 380, duration: 0, ease: "none" });
    gsap.from(maskSizeRef.current, { size: 0, duration: 0.8, ease: "power2.out" });

    const tick = () => {
      if (!isVisibleRef.current) { rafRef.current = requestAnimationFrame(tick); return; }
      const lerp = (a, b, t) => a + (b - a) * t;

      const ls = lerpRef.current;
      ls.maskX = lerp(ls.maskX, ls.mouseX, 0.1);
      ls.maskY = lerp(ls.maskY, ls.mouseY, 0.1);
      ls.camX = lerp(ls.camX, (ls.mouseX - window.innerWidth / 2) * 0.018, 0.06);
      ls.camY = lerp(ls.camY, (ls.mouseY - window.innerHeight / 2) * 0.018, 0.06);

      const camZ = cameraZRef.current.z;
      const ms = maskSizeRef.current.size;

      const baseTx = `translate(${ls.camX}px,${ls.camY}px)`;
      if (baseCamRef.current) baseCamRef.current.style.transform = baseTx;
      if (maskedCamRef.current) maskedCamRef.current.style.transform = baseTx;

      // Move clip rect
      if (clipRectRef.current) {
        clipRectRef.current.setAttribute("x", ls.maskX - ms / 2);
        clipRectRef.current.setAttribute("y", ls.maskY - ms / 2);
        clipRectRef.current.setAttribute("width", ms);
        clipRectRef.current.setAttribute("height", ms);
      }
      if (cursorFrameRef.current) {
        cursorFrameRef.current.style.transform = `translate(${ls.maskX - ms / 2}px,${ls.maskY - ms / 2}px)`;
      }

      // Translate each image wrapper by its z
      layoutPxRef.current.forEach((lp, i) => {
        const relZ = lp.z + camZ;
        const baseEl = baseImgsRef.current[i];
        const maskEl = maskedImgsRef.current[i];
        const tx = lp.x - lp.width / 2;
        const ty = lp.y;
        const style = `translate(${tx}px,${ty}px) translateZ(${relZ}px)`;
        if (baseEl) baseEl.style.transform = style;
        if (maskEl) maskEl.style.transform = style;
      });

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [recomputeLayout]);

  // ── Mouse / Touch / Wheel ────────────────────────────────────────────────
  useEffect(() => {
    const onMouse = (e) => {
      lerpRef.current.mouseX = e.clientX;
      lerpRef.current.mouseY = e.clientY;
    };
    const onTouch = (e) => {
      if (e.touches[0]) {
        lerpRef.current.mouseX = e.touches[0].clientX;
        lerpRef.current.mouseY = e.touches[0].clientY;
      }
    };
    let lastSwipeX = 0, lastSwipeY = 0;
    const onTouchStart = (e) => {
      if (e.touches[0]) { lastSwipeX = e.touches[0].clientX; lastSwipeY = e.touches[0].clientY; }
    };
    const onTouchEnd = (e) => {
      if (e.changedTouches[0]) {
        const dx = e.changedTouches[0].clientX - lastSwipeX;
        const dy = e.changedTouches[0].clientY - lastSwipeY;
        if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 40) {
          goToChapter(chapterIdxRef.current + (dy < 0 ? 1 : -1));
        } else if (Math.abs(dx) > 40) {
          goToChapter(chapterIdxRef.current + (dx < 0 ? 1 : -1));
        }
      }
    };
    let wheelTimer;
    const onWheel = (e) => {
      e.preventDefault();
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => {
        goToChapter(chapterIdxRef.current + (e.deltaY > 0 ? 1 : -1));
      }, 60);
    };

    window.addEventListener("mousemove", onMouse);
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("wheel", onWheel);
    };
  }, [goToChapter]);

  // ── Image parallax on hover ──────────────────────────────────────────────
  const onMouseMoveImg = (e, i) => {
    const el = baseImgsRef.current[i];
    const mel = maskedImgsRef.current[i];
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const rx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ry = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    const style = { rotateX: -ry * 10, rotateY: rx * 10, x: rx * 6, y: ry * 6, duration: 0.3, ease: "power2.out", overwrite: "auto" };
    if (el) gsap.to(el, style);
    if (mel) gsap.to(mel, style);
  };

  const onMouseLeaveImg = (i) => {
    const reset = { rotateX: 0, rotateY: 0, x: 0, y: 0, duration: 0.5, ease: "power2.out", overwrite: "auto" };
    if (baseImgsRef.current[i]) gsap.to(baseImgsRef.current[i], reset);
    if (maskedImgsRef.current[i]) gsap.to(maskedImgsRef.current[i], reset);
  };

  const handleImgClick = (it) => {
    if (onItemClick) onItemClick(it);
  };

  // ── Render images ────────────────────────────────────────────────────────
  const renderImages = (isMasked) =>
    layout.map((l, i) => {
      const it = l.item;
      return (
        <div
          key={`${it.id}-${isMasked ? "m" : "b"}`}
          ref={(el) => {
            if (isMasked) maskedImgsRef.current[i] = el;
            else baseImgsRef.current[i] = el;
          }}
          className="hm-image-wrapper"
          style={{
            width: `${l.width}vw`,
            // entrance stagger via animationDelay
            animation: `hmImageIn 0.6s ease ${(i % 10) * 0.06}s both`,
          }}
          onClick={() => handleImgClick(it)}
          onMouseMove={!isMasked ? (e) => onMouseMoveImg(e, i) : undefined}
          onMouseLeave={!isMasked ? () => onMouseLeaveImg(i) : undefined}
        >
          <div className="hm-image-inner">
            <ImgWithLoad
              src={it.image}
              isMasked={isMasked}
            />
            {!isMasked && <div className="hm-image-placeholder" />}
          </div>
        </div>
      );
    });

  return (
    <>
      <div className="hm-wrapper">
        {/* Base layer */}
        <div className="hm-page hm-layer-base">
          <div ref={baseCamRef} className="hm-camera">
            {renderImages(false)}
          </div>
        </div>

        {/* SVG cursor mask */}
        <svg
          style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}
        >
          <defs>
            <filter id="hm-soft-blur">
              <feGaussianBlur stdDeviation="18" />
            </filter>
            <mask id="hm-cursor-mask">
              <rect width="100%" height="100%" fill="black" />
              <rect
                ref={clipRectRef}
                width="380" height="380"
                fill="white"
                filter="url(#hm-soft-blur)"
              />
            </mask>
          </defs>
        </svg>

        {/* Masked full-color layer */}
        <div
          className="hm-page hm-layer-masked"
          style={{ maskImage: "url(#hm-cursor-mask)", WebkitMaskImage: "url(#hm-cursor-mask)" }}
        >
          <div ref={maskedCamRef} className="hm-camera">
            {renderImages(true)}
          </div>
        </div>

        {/* Cursor frame */}
        <div ref={cursorFrameRef} className="hm-cursor-frame" />

        {/* UI Overlay */}
        <div className="hm-ui">
          <div className="hm-title-wrap" onClick={() => {
            const curCat = seriesIds[chapterIdx];
            const it = items.find((x) => x.category === curCat);
            if (it && onItemClick) onItemClick(it);
          }}>
            <h1 ref={titleRef} className="hm-title">{displayTitle}</h1>
            <p className="hm-subtitle">MEMORIES</p>
          </div>

          <div className="hm-scroll-hint">
            <span className="hm-desktop">SCROLL TO EXPLORE MEMORIES</span>
            <span className="hm-mobile">VUỐT ĐỂ KHÁM PHÁ</span>
          </div>

          <div className="hm-counter">
            {chapterIdx + 1} OF {seriesIds.length}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Lazy-loaded image with is-loaded class ────────────────────────────────
function ImgWithLoad({ src, isMasked }) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true);
  }, [src]);

  if (isMasked) {
    return (
      <img
        ref={imgRef}
        src={src}
        alt=""
        decoding="async"
        className="hm-image-masked"
        onLoad={() => setLoaded(true)}
      />
    );
  }

  return (
    <img
      ref={imgRef}
      src={src}
      alt=""
      decoding="async"
      className={`hm-image${loaded ? " is-loaded" : ""}`}
      style={{ visibility: "hidden" }}
      onLoad={() => setLoaded(true)}
    />
  );
}
