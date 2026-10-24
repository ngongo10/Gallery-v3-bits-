import { useEffect, useRef, useState, useCallback } from "react";
import "./ImageLightbox.css";

// SVG warp filter — elastic distortion during hero transition
function WarpFilter() {
  return (
    <svg
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <defs>
        <filter id="lb-magic-warp" x="-25%" y="-25%" width="150%" height="150%" colorInterpolationFilters="sRGB">
          <feTurbulence
            id="lb-turbulence"
            type="turbulence"
            baseFrequency="0 0"
            numOctaves="3"
            seed="8"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="0"
            xChannelSelector="R"
            yChannelSelector="G"
            id="lb-displacement"
          />
        </filter>
      </defs>
    </svg>
  );
}

export default function ImageLightbox({
  items = [],
  initialIndex = 0,
  src,
  alt,
  onClose,
  onChangeIndex,
  actionButton,
  originRect = null,
}) {
  const galleryItems = items.length > 0
    ? items
    : src
      ? [{ image: src, caption: alt || "" }]
      : [];

  const [currentIndex, setCurrentIndex] = useState(() => {
    if (initialIndex >= 0 && initialIndex < galleryItems.length) return initialIndex;
    return 0;
  });

  const overlayRef = useRef(null);
  const imgRef = useRef(null);
  const isClosingRef = useRef(false);
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const touchDeltaRef = useRef({ x: 0, y: 0 });
  const doubleTapTimer = useRef(null);
  const isSwipingRef = useRef(false);
  const rafRef = useRef(null);

  const total = galleryItems.length;
  const currentItem = galleryItems[currentIndex] || {};
  const currentSrc = currentItem.image || currentItem.src || src;
  const currentAlt = currentItem.caption || currentItem.alt || alt || `Photo ${currentIndex + 1}`;

  // Animate SVG turbulence intensity with rAF
  const animateTurbulence = useCallback((fromScale, toScale, duration, startDisplace, endDisplace) => {
    const turbEl = document.getElementById('lb-turbulence');
    const displEl = document.getElementById('lb-displacement');
    if (!turbEl || !displEl) return;

    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - t, 3);
      const freq = fromScale + (toScale - fromScale) * ease;
      const displace = startDisplace + (endDisplace - startDisplace) * ease;
      turbEl.setAttribute('baseFrequency', `${freq.toFixed(4)} ${(freq * 0.7).toFixed(4)}`);
      displEl.setAttribute('scale', displace.toFixed(1));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else {
        turbEl.setAttribute('baseFrequency', '0 0');
        displEl.setAttribute('scale', '0');
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  // Hero open animation
  useEffect(() => {
    if (!originRect) return;
    const img = imgRef.current;
    const overlay = overlayRef.current;
    if (!img || !overlay) return;

    // Trigger hero animation once image layout is ready or loaded
    const runHeroAnimation = () => {
      const finalRect = img.getBoundingClientRect();
      if (!finalRect.width || !finalRect.height) {
        requestAnimationFrame(runHeroAnimation);
        return;
      }

      // Restore opacity for WAAPI
      img.style.opacity = '1';

      const scaleX = originRect.width / finalRect.width;
      const scaleY = originRect.height / finalRect.height;
      const tx = (originRect.left + originRect.width / 2) - (finalRect.left + finalRect.width / 2);
      const ty = (originRect.top + originRect.height / 2) - (finalRect.top + finalRect.height / 2);

      // Đường bay parabol ngược (hơi võng xuống nhẹ hoặc cong bổng hình cánh cung tự nhiên):
      const arcOffsetY = Math.max(30, Math.min(90, Math.abs(tx) * 0.18 + Math.abs(ty) * 0.12));

      // Phase 1: Hero fly + arc parabol + elastic warp
      img.animate([
        {
          transform: `translate(${tx}px, ${ty}px) scale(${scaleX}, ${scaleY}) rotate(${-tx * 0.008}deg)`,
          filter: 'url(#lb-magic-warp)',
          borderRadius: '8px',
          opacity: 1,
          offset: 0,
        },
        {
          // Điểm 35% quỹ đạo: rơi vào bụng parabol ngược (võng xuống tạo đà mềm mại)
          transform: `translate(${tx * 0.62}px, ${ty * 0.52 + arcOffsetY}px) scale(${scaleX + (1 - scaleX) * 0.45}, ${scaleY + (1 - scaleY) * 0.42}) rotate(${-tx * 0.005}deg)`,
          filter: 'url(#lb-magic-warp)',
          borderRadius: '6px',
          opacity: 1,
          offset: 0.35,
        },
        {
          // Điểm 70%: lượn lên từ parabol, nở rộng hơn (elastic squish nhẹ)
          transform: `translate(${tx * 0.12}px, ${ty * 0.08 + arcOffsetY * 0.2}px) scale(${1 + (1 - scaleX) * 0.04}, ${1 - (1 - scaleY) * 0.03}) rotate(${-tx * 0.002}deg)`,
          filter: 'url(#lb-magic-warp)',
          borderRadius: '4px',
          opacity: 1,
          offset: 0.72,
        },
        {
          // Stretch overshoot nhẹ trước khi vào form
          transform: `translate(0, ${-arcOffsetY * 0.05}px) scale(${1 - (1 - scaleX) * 0.015}, ${1 + (1 - scaleY) * 0.01}) rotate(0deg)`,
          filter: 'none',
          borderRadius: '3px',
          opacity: 1,
          offset: 0.88,
        },
        {
          transform: 'translate(0, 0) scale(1) rotate(0deg)',
          filter: 'none',
          borderRadius: '3px',
          opacity: 1,
          offset: 1,
        },
      ], {
        duration: 640,
        easing: 'cubic-bezier(0.18, 0.95, 0.28, 1)',
        fill: 'both',
      });

      // Overlay fade in
      overlay.animate([
        { backgroundColor: 'rgba(0,0,0,0)', backdropFilter: 'blur(0px)', WebkitBackdropFilter: 'blur(0px)' },
        { backgroundColor: 'rgba(0,0,0,0.94)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' },
      ], {
        duration: 380,
        easing: 'ease-out',
        fill: 'both',
      });

      // SVG warp: spike then fade
      animateTurbulence(0.022, 0, 550, 28, 0);
    };

    if (img.complete && img.naturalWidth > 0) {
      runHeroAnimation();
    } else {
      img.addEventListener('load', runHeroAnimation, { once: true });
    }

    return () => {
      img.removeEventListener('load', runHeroAnimation);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []); // only on mount

  // Animated close
  const handleClose = useCallback(() => {
    if (isClosingRef.current) return;

    if (!originRect || !imgRef.current) {
      onClose();
      return;
    }

    isClosingRef.current = true;
    const img = imgRef.current;
    const overlay = overlayRef.current;

    const finalRect = img.getBoundingClientRect();
    if (!finalRect.width) { onClose(); return; }

    const scaleX = originRect.width / finalRect.width;
    const scaleY = originRect.height / finalRect.height;
    const tx = (originRect.left + originRect.width / 2) - (finalRect.left + finalRect.width / 2);
    const ty = (originRect.top + originRect.height / 2) - (finalRect.top + finalRect.height / 2);

    // Warp spike on close
    const turbEl = document.getElementById('lb-turbulence');
    const displEl = document.getElementById('lb-displacement');
    if (turbEl && displEl) {
      turbEl.setAttribute('baseFrequency', '0.018 0.012');
      displEl.setAttribute('scale', '20');
    }

    // Quỹ đạo parabol ngược khi thu lại về thumbnail
    const arcOffsetY = Math.max(25, Math.min(80, Math.abs(tx) * 0.15 + Math.abs(ty) * 0.1));

    img.animate([
      { transform: 'translate(0,0) scale(1) rotate(0deg)', filter: 'url(#lb-magic-warp)', opacity: 1, offset: 0 },
      { transform: `translate(${tx * 0.4}px, ${ty * 0.35 + arcOffsetY}px) scale(${(scaleX + 1) / 2}, ${(scaleY + 1) / 2}) rotate(${tx * 0.004}deg)`, filter: 'url(#lb-magic-warp)', opacity: 0.9, offset: 0.42 },
      { transform: `translate(${tx}px, ${ty}px) scale(${scaleX}, ${scaleY}) rotate(${tx * 0.008}deg)`, filter: 'url(#lb-magic-warp)', opacity: 0, offset: 1 },
    ], {
      duration: 380,
      easing: 'cubic-bezier(0.35, 0, 0.6, 0.9)',
      fill: 'both',
    });

    overlay?.animate([
      { backgroundColor: 'rgba(0,0,0,0.94)', backdropFilter: 'blur(16px)' },
      { backgroundColor: 'rgba(0,0,0,0)', backdropFilter: 'blur(0px)' },
    ], {
      duration: 300,
      easing: 'ease-in',
      fill: 'both',
    });

    setTimeout(() => onClose(), 370);
  }, [originRect, onClose]);

  // Keyboard
  const handleNext = useCallback((e) => {
    if (e) e.stopPropagation();
    if (total <= 1) return;
    setCurrentIndex((prev) => {
      const next = (prev + 1) % total;
      onChangeIndex?.(next);
      return next;
    });
  }, [total, onChangeIndex]);

  const handlePrev = useCallback((e) => {
    if (e) e.stopPropagation();
    if (total <= 1) return;
    setCurrentIndex((prev) => {
      const next = (prev - 1 + total) % total;
      onChangeIndex?.(next);
      return next;
    });
  }, [total, onChangeIndex]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') handleClose();
      else if (e.key === 'ArrowRight') handleNext();
      else if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleClose, handleNext, handlePrev]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const handleOverlayClick = useCallback((e) => {
    if (e.target === overlayRef.current) handleClose();
  }, [handleClose]);

  const handleImageDoubleClick = useCallback((e) => {
    e.stopPropagation();
    handleClose();
  }, [handleClose]);

  // Touch handlers
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
      touchDeltaRef.current = { x: 0, y: 0 };
      isSwipingRef.current = true;
    }
  };

  const handleTouchMove = (e) => {
    if (!isSwipingRef.current || e.touches.length !== 1) return;
    const touch = e.touches[0];
    touchDeltaRef.current = {
      x: touch.clientX - touchStartRef.current.x,
      y: touch.clientY - touchStartRef.current.y,
    };
  };

  const handleTouchEnd = (e) => {
    if (!isSwipingRef.current) return;
    isSwipingRef.current = false;
    const { x: deltaX, y: deltaY } = touchDeltaRef.current;
    const absX = Math.abs(deltaX), absY = Math.abs(deltaY);
    if (absX > 45 && absX > absY) {
      deltaX < 0 ? handleNext() : handlePrev();
      return;
    }
    if (absX < 10 && absY < 10) {
      if (doubleTapTimer.current) {
        clearTimeout(doubleTapTimer.current);
        doubleTapTimer.current = null;
        handleClose();
      } else {
        doubleTapTimer.current = setTimeout(() => { doubleTapTimer.current = null; }, 320);
      }
    }
  };

  if (!currentSrc) return null;

  return (
    <div
      ref={overlayRef}
      className={`lb-overlay${originRect ? ' lb-overlay--hero' : ''}`}
      onClick={handleOverlayClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="dialog"
      aria-modal="true"
      aria-label="Image gallery zoom"
    >
      <WarpFilter />

      {/* Top Header Bar */}
      <div className="lb-header">
        {total > 1 && (
          <div className="lb-counter">
            <span>{currentIndex + 1}</span>
            <span className="lb-counter-sep">/</span>
            <span>{total}</span>
          </div>
        )}
        <button type="button" className="lb-close" onClick={handleClose} aria-label="Đóng (Close)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Navigation Arrows */}
      {total > 1 && (
        <>
          <button type="button" className="lb-arrow lb-arrow--prev" onClick={handlePrev} aria-label="Ảnh trước">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button type="button" className="lb-arrow lb-arrow--next" onClick={handleNext} aria-label="Ảnh tiếp theo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </>
      )}

      {/* Main Image Stage */}
      <div className="lb-stage">
        <img
          key={currentSrc}
          ref={imgRef}
          className="lb-img"
          src={currentSrc}
          alt={currentAlt}
          draggable={false}
          onDoubleClick={handleImageDoubleClick}
        />
      </div>

      {/* Footer */}
      <div className="lb-footer">
        {actionButton && <div className="lb-action-wrap">{actionButton}</div>}
        {currentItem.storyText ? (
          <p className="lb-caption">{currentItem.storyText}</p>
        ) : currentItem.caption ? (
          <p className="lb-caption">{currentItem.caption}</p>
        ) : null}
        <p className="lb-hint">Vuốt hoặc dùng mũi tên để chuyển ảnh • Nhấn đúp để đóng</p>
      </div>
    </div>
  );
}
