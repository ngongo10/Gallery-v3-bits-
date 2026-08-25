import { useEffect, useRef, useState, useMemo } from "react";
import gsap from "gsap";
import "./HomeMosaic.css";

const CHAPTER_Z_SPACING = 5000;
const VIRTUAL_W = 3200;
const VIRTUAL_H = 2000;
const TABLE_X = VIRTUAL_W * 0.44;
const TABLE_Y = VIRTUAL_H * 0.44;
const GAP = 240;

function pseudoRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const SECTOR_OFFSETS = [
  { xRatio: -0.58, yRatio: -0.55 },
  { xRatio:  0.0,  yRatio: -0.60 },
  { xRatio:  0.58, yRatio: -0.55 },
  { xRatio: -0.60, yRatio:  0.05 },
  { xRatio:  0.60, yRatio:  0.05 },
  { xRatio: -0.58, yRatio:  0.58 },
  { xRatio:  0.0,  yRatio:  0.60 },
  { xRatio:  0.58, yRatio:  0.58 }
];

export default function HomeMosaic({ items = [], onItemClick }) {
  // Lấy danh sách các series từ items (mỗi category = 1 series)
  const seriesList = useMemo(() => {
    const map = new Map();
    items.forEach((it) => {
      if (!map.has(it.category)) {
        map.set(it.category, {
          id: it.category,
          title: it.categoryLabel || it.category,
          images: [],
        });
      }
      map.get(it.category).images.push(it);
    });
    return Array.from(map.values());
  }, [items]);

  // Lấy tối đa 8 ảnh cho mỗi series
  const allImages = useMemo(() => {
    return seriesList.flatMap((s) =>
      s.images.slice(0, 8).map((img) => ({
        ...img,
        seriesId: s.id,
      }))
    );
  }, [seriesList]);

  // Tính toán vị trí không đè lên nhau (Collision Detection)
  const { seriesPositions, tunnelLayout } = useMemo(() => {
    const sPositions = new Map();

    for (const s of seriesList) {
      const placed = [];
      const imgs = s.images.slice(0, 8);

      for (let idx = 0; idx < imgs.length; idx++) {
        const seed = hashString(s.id + "::" + idx);
        const w_px = 220 + pseudoRandom(seed) * 220;
        const h_px = w_px / 1.5;

        const sector = SECTOR_OFFSETS[idx % SECTOR_OFFSETS.length];
        const sectorCenterX = sector.xRatio * TABLE_X;
        const sectorCenterY = sector.yRatio * TABLE_Y;

        let bestX = sectorCenterX;
        let bestY = sectorCenterY;
        let found = false;

        for (let attempt = 0; attempt < 500 && !found; attempt++) {
          const offsetX = (-0.5 + pseudoRandom(seed + attempt * 13 + 99)) * (TABLE_X * 0.45);
          const offsetY = (-0.5 + pseudoRandom(seed + attempt * 17 + 199)) * (TABLE_Y * 0.45);
          const testX = Math.max(-TABLE_X, Math.min(TABLE_X, sectorCenterX + offsetX));
          const testY = Math.max(-TABLE_Y, Math.min(TABLE_Y, sectorCenterY + offsetY));

          let collides = false;
          for (const box of placed) {
            const l1 = testX - w_px / 2 - GAP;
            const r1 = testX + w_px / 2 + GAP;
            const t1 = testY - h_px / 2 - GAP;
            const b1 = testY + h_px / 2 + GAP;
            const l2 = box.x - box.w / 2;
            const r2 = box.x + box.w / 2;
            const t2 = box.y - box.h / 2;
            const b2 = box.y + box.h / 2;
            if (!(l1 > r2 || r1 < l2 || t1 > b2 || b1 < t2)) {
              collides = true;
              break;
            }
          }
          if (!collides) {
            bestX = testX;
            bestY = testY;
            found = true;
          }
        }

        if (!found) {
          bestX = sectorCenterX;
          bestY = sectorCenterY;
        }
        placed.push({ x: bestX, y: bestY, w: w_px, h: h_px });
      }
      sPositions.set(s.id, placed);
    }

    const tLayout = allImages.map((img) => {
      const seriesIndex = seriesList.findIndex((s) => s.id === img.seriesId);
      const series = seriesList[seriesIndex];
      const indexInSeries = series ? series.images.findIndex((x) => x.id === img.id) : 0;
      const z = -(seriesIndex * CHAPTER_Z_SPACING);

      const baseSeed = hashString(img.image);
      const lagSpeed = 0.05 + pseudoRandom(baseSeed + 99) * 0.10;

      const positions = sPositions.get(img.seriesId) ?? [];
      const pos = positions[indexInSeries] ?? { x: 0, y: 0, w: 250, h: 167 };

      const x = (pos.x / VIRTUAL_W) * 100;
      const y = (pos.y / VIRTUAL_H) * 100;
      const width = (pos.w / VIRTUAL_W) * 100;

      return { x, y, z, width, seriesIndex, lagSpeed };
    });

    return { seriesPositions: sPositions, tunnelLayout: tLayout };
  }, [seriesList, allImages]);

  const [activeSeriesIndex, setActiveSeriesIndex] = useState(0);
  const activeSeries = seriesList[activeSeriesIndex];
  const [displayTitle, setDisplayTitle] = useState(activeSeries?.title || "MEMORIES");
  const scrambleIntervalRef = useRef(null);

  const triggerScramble = (overrideText) => {
    if (scrambleIntervalRef.current) cancelAnimationFrame(scrambleIntervalRef.current);
    const originalText = overrideText || activeSeries?.title || "MEMORIES";
    const glyphs = "0123456789@!#$%&?*+=-_[]{}<>/\\|";
    let frame = 0;
    const queue = [];

    for (let i = 0; i < originalText.length; i++) {
      const to = originalText[i];
      const start = Math.floor(Math.random() * 15);
      const end = start + Math.floor(Math.random() * 30) + 15;
      queue.push({ to, start, end, char: undefined });
    }

    const update = () => {
      let output = "";
      let complete = 0;
      for (let i = 0; i < queue.length; i++) {
        const item = queue[i];
        if (frame >= item.end) {
          complete++;
          output += item.to;
        } else if (frame >= item.start) {
          if (!item.char || Math.random() < 0.3) {
            item.char = glyphs[Math.floor(Math.random() * glyphs.length)];
          }
          output += item.char;
        } else {
          output += " ";
        }
      }
      setDisplayTitle(output);
      if (complete === queue.length) return;
      frame++;
      scrambleIntervalRef.current = requestAnimationFrame(update);
    };
    update();
  };

  const isTransitioningRef = useRef(false);
  const isLeavingPageRef = useRef(false);
  const isHomeVisibleRef = useRef(true);
  const currentChapterRef = useRef(0);

  const baseCameraRef = useRef(null);
  const maskedCameraRef = useRef(null);
  const pageWrapperRef = useRef(null);
  const clipRectRef = useRef(null);
  const glitchCursorRef = useRef(null);
  const titleRef = useRef(null);

  const baseImagesRef = useRef([]);
  const maskedImagesRef = useRef([]);

  const layoutPxRef = useRef([]);
  const cameraZRef = useRef({ z: 0 });
  const maskSizeRef = useRef({ size: 450 });
  const transitionStateRef = useRef({ tx: 0, ty: 0, scale: 1, opacity: 1 });

  const lerpState = useRef({
    mouseX: typeof window !== "undefined" ? window.innerWidth / 2 : 0,
    mouseY: typeof window !== "undefined" ? window.innerHeight / 2 : 0,
    maskX: typeof window !== "undefined" ? window.innerWidth / 2 : 0,
    maskY: typeof window !== "undefined" ? window.innerHeight / 2 : 0,
    camX: 0,
    camY: 0,
  });

  // Recompute layout pixels
  const handleResize = () => {
    if (typeof window === "undefined") return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const isDesktop = w > 800;
    const spreadMultiplierX = isDesktop ? 1.0 : 0.6;
    const spreadMultiplierY = isDesktop ? 1.0 : 0.6;
    const currentZ = cameraZRef.current.z;

    layoutPxRef.current = tunnelLayout.map((layout, i) => {
      const existing = layoutPxRef.current[i];
      return {
        x: ((layout.x * spreadMultiplierX) / 100) * w,
        y: ((layout.y * spreadMultiplierY) / 100) * h,
        z: layout.z,
        width: (layout.width / 100) * w,
        currentCamZ: existing && existing.currentCamZ !== undefined ? existing.currentCamZ : currentZ,
      };
    });
  };

  // Entrance & Resize
  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);

    // Kính lúp (Lens) bung mở: từ 0 -> bung 540px -> co lại 450px
    maskSizeRef.current.size = 0;
    gsap.timeline()
      .to(maskSizeRef.current, { size: 540, duration: 0.9, ease: "power3.out" })
      .to(maskSizeRef.current, { size: 450, duration: 0.6, ease: "power2.inOut" });

    // Camera 3D Fly-In
    const targetZ = currentChapterRef.current * CHAPTER_Z_SPACING;
    cameraZRef.current.z = targetZ - 2200;
    gsap.to(cameraZRef.current, {
      z: targetZ,
      duration: 1.6,
      ease: "power4.out",
    });

    if (titleRef.current) {
      gsap.set(titleRef.current, { opacity: 0, y: 35, scale: 0.95 });
      gsap.to(titleRef.current, { opacity: 1, y: 0, scale: 1, duration: 1.0, delay: 0.4, ease: "back.out(1.4)" });
    }

    return () => window.removeEventListener("resize", handleResize);
  }, [tunnelLayout]);

  // Main RAF loop
  useEffect(() => {
    const onMouseMove = (e) => {
      lerpState.current.mouseX = e.clientX;
      lerpState.current.mouseY = e.clientY;
    };
    window.addEventListener("mousemove", onMouseMove);

    // Touch support cho kính lúp mobile
    let touchHoldTimer = null;
    let isDraggingLens = false;
    let touchStartPosX = 0;
    let touchStartPosY = 0;

    const onTouchStartLens = (e) => {
      if (!e.touches[0]) return;
      touchStartPosX = e.touches[0].clientX;
      touchStartPosY = e.touches[0].clientY;
      isDraggingLens = false;
      if (touchHoldTimer) clearTimeout(touchHoldTimer);
      touchHoldTimer = setTimeout(() => {
        isDraggingLens = true;
        lerpState.current.mouseX = touchStartPosX;
        lerpState.current.mouseY = touchStartPosY;
      }, 300);
    };

    const onTouchMoveLens = (e) => {
      if (!e.touches[0]) return;
      const dx = Math.abs(e.touches[0].clientX - touchStartPosX);
      const dy = Math.abs(e.touches[0].clientY - touchStartPosY);
      if (!isDraggingLens && (dx > 10 || dy > 10)) {
        if (touchHoldTimer) clearTimeout(touchHoldTimer);
        return;
      }
      if (isDraggingLens) {
        lerpState.current.mouseX = e.touches[0].clientX;
        lerpState.current.mouseY = e.touches[0].clientY;
      }
    };

    const onTouchEndLens = () => {
      if (touchHoldTimer) clearTimeout(touchHoldTimer);
      isDraggingLens = false;
      lerpState.current.mouseX = window.innerWidth / 2;
      lerpState.current.mouseY = window.innerHeight / 2;
    };

    window.addEventListener("touchstart", onTouchStartLens, { passive: true });
    window.addEventListener("touchmove", onTouchMoveLens, { passive: true });
    window.addEventListener("touchend", onTouchEndLens, { passive: true });

    let rafId;
    const ticker = () => {
      const isLeaving = isLeavingPageRef.current;
      const state = lerpState.current;
      const cw = window.innerWidth / 2;
      const ch = window.innerHeight / 2;

      // 1. Lerp mask & cursor
      state.maskX += (state.mouseX - state.maskX) * 0.15;
      state.maskY += (state.mouseY - state.maskY) * 0.15;

      const rotation = (state.mouseX / window.innerWidth - 0.5) * 30;

      if (clipRectRef.current) {
        const size = maskSizeRef.current.size;
        clipRectRef.current.setAttribute("width", String(size));
        clipRectRef.current.setAttribute("height", String(size));
        clipRectRef.current.setAttribute("x", String(state.maskX - size / 2));
        clipRectRef.current.setAttribute("y", String(state.maskY - size / 2));
        clipRectRef.current.setAttribute("transform", `rotate(${rotation}, ${state.maskX}, ${state.maskY})`);
      }

      if (glitchCursorRef.current) {
        glitchCursorRef.current.style.transform = `translate(${state.maskX}px, ${state.maskY}px) translate(-50%, -50%) rotate(${rotation}deg)`;
      }

      // 2. Parallax camera
      const targetCamX = (cw - state.mouseX) * 0.4;
      const targetCamY = (ch - state.mouseY) * 0.4;
      state.camX += (targetCamX - state.camX) * 0.08;
      state.camY += (targetCamY - state.camY) * 0.08;

      // 3. Apply Camera transform
      const ts = transitionStateRef.current;
      const finalX = state.camX + ts.tx;
      const finalY = state.camY + ts.ty;
      const transform = `translate3d(${finalX}px, ${finalY}px, 0px) scale(${ts.scale})`;
      if (baseCameraRef.current) {
        baseCameraRef.current.style.transform = transform;
        baseCameraRef.current.style.opacity = String(ts.opacity);
      }
      if (maskedCameraRef.current) {
        maskedCameraRef.current.style.transform = transform;
        maskedCameraRef.current.style.opacity = String(ts.opacity);
      }

      // 4. Update image positions & Depth loop
      if (!isLeaving && seriesList.length > 0) {
        const targetCamZ = cameraZRef.current.z;
        const LOOP_DEPTH = seriesList.length * CHAPTER_Z_SPACING;

        tunnelLayout.forEach((layout, i) => {
          const px = layoutPxRef.current[i];
          if (!px) return;

          const baseChapterZ = -(layout.seriesIndex * CHAPTER_Z_SPACING);
          const offset = Math.round((-targetCamZ - baseChapterZ) / LOOP_DEPTH) * LOOP_DEPTH;
          const absoluteZ = baseChapterZ + offset;

          if (px.currentCamZ === undefined) px.currentCamZ = targetCamZ;
          px.currentCamZ += (targetCamZ - px.currentCamZ) * (layout.lagSpeed || 0.1);

          const relativeZ = absoluteZ + px.currentCamZ;

          let depthOpacity = 0;
          if (relativeZ >= -3500 && relativeZ <= 1500) {
            if (relativeZ < -2000) {
              depthOpacity = (relativeZ - -3500) / 1500;
            } else if (relativeZ > 500) {
              depthOpacity = (1500 - relativeZ) / 1000;
            } else {
              depthOpacity = 1;
            }
          }

          const isVisible = depthOpacity > 0;
          const imgTransform = `translate3d(${px.x}px, ${px.y}px, ${relativeZ}px) translate(-50%, -50%)`;

          if (baseImagesRef.current[i]) {
            baseImagesRef.current[i].style.transform = imgTransform;
            baseImagesRef.current[i].style.opacity = String(depthOpacity);
            baseImagesRef.current[i].style.pointerEvents = isVisible ? "auto" : "none";
            baseImagesRef.current[i].style.cursor = isVisible ? "pointer" : "default";
            baseImagesRef.current[i].style.visibility = isVisible ? "visible" : "hidden";
          }
          if (maskedImagesRef.current[i]) {
            maskedImagesRef.current[i].style.transform = imgTransform;
            maskedImagesRef.current[i].style.opacity = isVisible ? String(depthOpacity) : "0";
            maskedImagesRef.current[i].style.visibility = isVisible ? "visible" : "hidden";
            maskedImagesRef.current[i].style.pointerEvents = isVisible ? "auto" : "none";
            maskedImagesRef.current[i].style.cursor = isVisible ? "pointer" : "default";
          }
        });
      } else if (isLeaving) {
        // UFO transition mode: apply animated px.x/px.y
        tunnelLayout.forEach((_layout, i) => {
          const px = layoutPxRef.current[i];
          if (!px) return;
          const frozenZ = px.frozenRelativeZ ?? 0;
          const imgTransform = `translate3d(${px.x}px, ${px.y}px, ${frozenZ}px) translate(-50%, -50%)`;
          if (baseImagesRef.current[i]) {
            baseImagesRef.current[i].style.transform = imgTransform;
            baseImagesRef.current[i].style.visibility = "visible";
          }
          if (maskedImagesRef.current[i]) {
            maskedImagesRef.current[i].style.transform = imgTransform;
            maskedImagesRef.current[i].style.visibility = "visible";
          }
        });
      }

      rafId = requestAnimationFrame(ticker);
    };

    rafId = requestAnimationFrame(ticker);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchstart", onTouchStartLens);
      window.removeEventListener("touchmove", onTouchMoveLens);
      window.removeEventListener("touchend", onTouchEndLens);
      if (touchHoldTimer) clearTimeout(touchHoldTimer);
      cancelAnimationFrame(rafId);
    };
  }, [seriesList, tunnelLayout]);

  // Scroll, Touch & Auto-scroll change chapters
  useEffect(() => {
    let lastScrollTime = 0;
    const WHEEL_THROTTLE_MS = 2500;
    let autoScrollTimer = null;
    let mouseMoveTimer = null;
    let isMouseMoving = false;
    const isTouchDevice = () => !window.matchMedia("(pointer: fine)").matches;

    const changeChapter = (direction) => {
      if (seriesList.length === 0) return;
      const now = Date.now();
      if (now - lastScrollTime < WHEEL_THROTTLE_MS) return;
      lastScrollTime = now;

      if (isTransitioningRef.current) return;
      isTransitioningRef.current = true;

      currentChapterRef.current += direction;
      const wrappedIndex = (((currentChapterRef.current % seriesList.length) + seriesList.length) % seriesList.length);
      const nextSeries = seriesList[wrappedIndex];

      const targetZ = currentChapterRef.current * CHAPTER_Z_SPACING;

      const tl = gsap.timeline({
        onComplete: () => {
          isTransitioningRef.current = false;
        },
      });

      // 1. Thu nhỏ kính lúp
      tl.to(maskSizeRef.current, { size: 0, duration: 0.45, ease: "power2.inOut" });

      // 2. Camera lướt sang Chapter mới
      tl.to(cameraZRef.current, { z: targetZ, duration: 1.6, ease: "power3.inOut" });

      // 3. Nở kính lúp trở lại
      tl.to(maskSizeRef.current, { size: 450, duration: 0.75, ease: "power2.out" });

      // Đổi tiêu đề chạy chữ
      if (titleRef.current) {
        gsap.to(titleRef.current, {
          opacity: 0,
          y: -20,
          duration: 0.35,
          onComplete: () => {
            if (nextSeries) {
              setActiveSeriesIndex(wrappedIndex);
              triggerScramble(nextSeries.title);
            }
            if (titleRef.current) {
              gsap.fromTo(
                titleRef.current,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", delay: 0.2 }
              );
            }
          },
        });
      }

      resetAutoScroll();
    };

    const resetAutoScroll = () => {
      if (autoScrollTimer) clearInterval(autoScrollTimer);
      autoScrollTimer = setInterval(() => {
        if (isHomeVisibleRef.current && !isLeavingPageRef.current && document.visibilityState === "visible") {
          if (isTouchDevice() || !isMouseMoving) {
            changeChapter(1);
          }
        }
      }, 10000);
    };

    const handleMouseMove = () => {
      isMouseMoving = true;
      if (mouseMoveTimer) clearTimeout(mouseMoveTimer);
      mouseMoveTimer = setTimeout(() => {
        isMouseMoving = false;
      }, 2000);
    };

    resetAutoScroll();

    const handleWheel = (e) => {
      if (Math.abs(e.deltaY) <= 30) return;
      changeChapter(e.deltaY > 0 ? 1 : -1);
    };

    let touchStartX = 0;
    const handleTouchStart = (e) => {
      if (e.touches && e.touches[0]) touchStartX = e.touches[0].clientX;
    };
    const handleTouchEnd = (e) => {
      if (e.changedTouches && e.changedTouches[0]) {
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 40) {
          changeChapter(dx < 0 ? 1 : -1);
        }
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      if (autoScrollTimer) clearInterval(autoScrollTimer);
      if (mouseMoveTimer) clearTimeout(mouseMoveTimer);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [seriesList]);

  // UFO Suction Exit Transition khi click vào ảnh/tiêu đề
  const handleTransitionOut = (targetItem) => {
    if (isLeavingPageRef.current) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // 1. Đóng kính lúp + mờ tiêu đề
    gsap.to(maskSizeRef.current, { size: 0, duration: 0.3, ease: "power2.inOut" });
    if (titleRef.current) {
      gsap.to(titleRef.current, { opacity: 0, y: 30, duration: 0.3, ease: "power2.in" });
    }

    // 2. Lưu frozenRelativeZ
    const targetCamZ = cameraZRef.current.z;
    const LOOP_DEPTH = (seriesList.length || 1) * CHAPTER_Z_SPACING;
    layoutPxRef.current.forEach((px, i) => {
      if (!px) return;
      const layout = tunnelLayout[i];
      if (!layout) return;
      const baseChapterZ = -(layout.seriesIndex * CHAPTER_Z_SPACING);
      const offset = Math.round((-targetCamZ - baseChapterZ) / LOOP_DEPTH) * LOOP_DEPTH;
      const absoluteZ = baseChapterZ + offset;
      px.frozenRelativeZ = absoluteZ + (px.currentCamZ ?? targetCamZ);
    });

    isLeavingPageRef.current = true;

    // 3. GSAP Timeline UFO Suction
    const tl = gsap.timeline({
      onComplete: () => {
        const itemToSelect = targetItem || items.find((x) => x.category === seriesList[activeSeriesIndex]?.id) || items[0];
        if (onItemClick && itemToSelect) onItemClick(itemToSelect);
      },
    });

    tl.to(lerpState.current, {
      mouseX: vw / 2,
      mouseY: vh + 500,
      duration: 0.9,
      ease: "power2.in",
    }, 0);

    layoutPxRef.current.forEach((px) => {
      if (!px) return;
      const distFromCenter = Math.abs(px.x) / (vw * 0.5);
      const stagger = distFromCenter * 0.15;
      tl.to(px, {
        x: 0,
        y: px.y + vh * 2.0,
        duration: 0.75,
        ease: "power3.in",
      }, stagger);
    });

    tl.to(transitionStateRef.current, {
      opacity: 0,
      duration: 0.5,
      ease: "power2.in",
    }, 0.3);
  };

  // Parallax Tilt & Shift khi rê chuột qua từng ảnh
  const handleMouseMoveImage = (e, i) => {
    const baseEl = baseImagesRef.current[i];
    const maskedEl = maskedImagesRef.current[i];
    if (!baseEl) return;
    const rect = baseEl.getBoundingClientRect();
    const relativeX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const relativeY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

    const tiltX = -relativeY * 12;
    const tiltY = relativeX * 12;
    const shiftX = relativeX * 8;
    const shiftY = relativeY * 8;

    const targetStyle = {
      rotateX: tiltX,
      rotateY: tiltY,
      x: shiftX,
      y: shiftY,
      duration: 0.3,
      ease: "power2.out",
      overwrite: "auto",
    };

    if (baseEl) gsap.to(baseEl, targetStyle);
    if (maskedEl) gsap.to(maskedEl, targetStyle);
  };

  const handleMouseLeave = (i) => {
    const baseEl = baseImagesRef.current[i];
    const maskedEl = maskedImagesRef.current[i];
    const resetStyle = {
      rotateX: 0,
      rotateY: 0,
      x: 0,
      y: 0,
      duration: 0.5,
      ease: "power2.out",
      overwrite: "auto",
    };
    if (baseEl) gsap.to(baseEl, resetStyle);
    if (maskedEl) gsap.to(maskedEl, resetStyle);
  };

  const renderImages = (isMasked) => {
    return allImages.map((img, i) => {
      const layout = tunnelLayout[i];
      if (!layout) return null;
      return (
        <div
          key={`${img.id}-${i}-${isMasked ? "mask" : "base"}`}
          ref={(el) => {
            if (isMasked) maskedImagesRef.current[i] = el;
            else baseImagesRef.current[i] = el;
          }}
          className="hm-image-wrapper"
          style={{ width: `${layout.width}vw` }}
          onClick={() => handleTransitionOut(img)}
          onMouseMove={!isMasked ? (e) => handleMouseMoveImage(e, i) : undefined}
          onMouseLeave={!isMasked ? () => handleMouseLeave(i) : undefined}
        >
          <div className="hm-image-wrapper-inner">
            <img
              src={img.image}
              alt=""
              decoding="async"
              className="hm-image"
              style={{ visibility: isMasked ? "visible" : "hidden" }}
            />
            {!isMasked && (
              <div
                className="hm-image-placeholder"
                style={{ backgroundColor: "#262626" }}
              />
            )}
          </div>
        </div>
      );
    });
  };

  return (
    <div ref={pageWrapperRef} className="hm-wrapper">
      {/* Base Layer: Solid color placeholders (chỉ hiện ô vuông màu bên ngoài kính lúp) */}
      <div className="hm-page hm-layer-base">
        <div ref={baseCameraRef} className="hm-camera">
          {renderImages(false)}
        </div>
      </div>

      {/* SVG Mask: Khung kính lúp */}
      <svg style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
        <defs>
          <filter id="soft-blur">
            <feGaussianBlur stdDeviation="15" />
          </filter>
          <mask id="hm-cursor-mask">
            <rect width="100%" height="100%" fill="black" />
            <rect ref={clipRectRef} width="450" height="450" fill="white" filter="url(#soft-blur)" />
          </mask>
        </defs>
      </svg>

      {/* Masked Layer: Ảnh thật sắc nét đầy màu sắc (chỉ lộ ra bên trong kính lúp) */}
      <div className="hm-page hm-masked-page">
        <div ref={maskedCameraRef} className="hm-camera">
          {renderImages(true)}
        </div>
      </div>

      {/* Glitch Cursor Frame */}
      <div ref={glitchCursorRef} className="hm-glitch-cursor" />

      {/* Floating UI */}
      <div className="hm-floating-ui">
        <div className="hm-title-container" onClick={() => handleTransitionOut()}>
          <span className="hm-title-badge">MEMORIES &bull; CHAPTER {activeSeriesIndex + 1}</span>
          <h1 ref={titleRef} className="hm-title">
            {displayTitle}
          </h1>
        </div>

        <div className="hm-bottom-center">
          <span className="hm-scroll-text">
            <span className="hm-desktop-text">SCROLL TO EXPLORE CHAPTERS</span>
            <span className="hm-mobile-text">VUỐT TRÁI, VUỐT PHẢI</span>
          </span>
        </div>

        <div className="hm-bottom-right">
          <span className="hm-counter">
            {activeSeriesIndex + 1} OF {seriesList.length}
          </span>
        </div>
      </div>
    </div>
  );
}
