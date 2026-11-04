import { useEffect, useRef, useState, useCallback, useLayoutEffect } from "react";
import "./ImageLightbox.css";

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
    : src ? [{ image: src, caption: alt || "" }] : [];

  const [currentIndex, setCurrentIndex] = useState(() =>
    initialIndex >= 0 && initialIndex < galleryItems.length ? initialIndex : 0
  );

  // "opening" | "open" | "closing"
  const [phase, setPhase] = useState("opening");
  const overlayRef = useRef(null);
  const imgRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const touchDeltaRef = useRef({ x: 0, y: 0 });
  const doubleTapRef = useRef(null);
  const isSwiping = useRef(false);
  const isClosingRef = useRef(false);

  const total = galleryItems.length;
  const currentItem = galleryItems[currentIndex] || {};
  const currentSrc = currentItem.image || currentItem.src || src;
  const currentAlt = currentItem.caption || currentItem.alt || alt || `Photo ${currentIndex + 1}`;

  // ── Bulletproof WAAPI Animation on Mount ─────────────────────────────────
  useLayoutEffect(() => {
    const img = imgRef.current;
    if (!originRect || !img) {
      setPhase("open");
      return;
    }

    const startAnimation = () => {
      const finalRect = img.getBoundingClientRect();
      if (!finalRect.width || !finalRect.height) {
        requestAnimationFrame(startAnimation);
        return;
      }

      const dx = (originRect.left + originRect.width / 2) - (finalRect.left + finalRect.width / 2);
      const dy = (originRect.top + originRect.height / 2) - (finalRect.top + finalRect.height / 2);
      const sx = originRect.width / finalRect.width;
      const sy = originRect.height / finalRect.height;

      // WAAPI guarantees the starting frame is rendered regardless of reflow timing
      const anim = img.animate(
        [
          {
            transform: `translate3d(${dx}px, ${dy}px, 0) scale(${sx}, ${sy})`,
            borderRadius: originRect.borderRadius || '2px',
          },
          {
            transform: 'translate3d(0, 0, 0) scale(1, 1)',
            borderRadius: '3px',
          }
        ],
        {
          duration: 520,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)', // Smooth deceleration
          fill: 'both'
        }
      );

      anim.onfinish = () => {
        setPhase("open");
        img.style.transform = 'translate3d(0, 0, 0) scale(1, 1)';
        img.style.borderRadius = '3px';
      };
    };

    if (img.complete && img.naturalWidth > 0) {
      startAnimation();
    } else {
      img.onload = startAnimation;
    }
  }, [originRect]);

  // ── Pure Fluid Motion Close: Travel back to thumbnail position ──────────
  const handleClose = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    setPhase("closing");

    const img = imgRef.current;
    if (img && originRect) {
      const finalRect = img.getBoundingClientRect();
      const dx = (originRect.left + originRect.width / 2) - (finalRect.left + finalRect.width / 2);
      const dy = (originRect.top + originRect.height / 2) - (finalRect.top + finalRect.height / 2);
      const sx = originRect.width / finalRect.width;
      const sy = originRect.height / finalRect.height;

      const anim = img.animate(
        [
          {
            transform: 'translate3d(0, 0, 0) scale(1, 1)',
            borderRadius: '3px',
          },
          {
            transform: `translate3d(${dx}px, ${dy}px, 0) scale(${sx}, ${sy})`,
            borderRadius: originRect.borderRadius || '2px',
          }
        ],
        {
          duration: 400,
          easing: 'cubic-bezier(0.2, 0, 0, 1)',
          fill: 'forwards'
        }
      );

      anim.onfinish = () => {
        onClose();
      };
    } else {
      onClose();
    }
  }, [originRect, onClose]);

  // ── Navigation ─────────────────────────────────────────────────────────────
  const handleNext = useCallback((e) => {
    if (e) e.stopPropagation();
    if (total <= 1) return;
    setCurrentIndex(prev => {
      const next = (prev + 1) % total;
      onChangeIndex?.(next);
      return next;
    });
  }, [total, onChangeIndex]);

  const handlePrev = useCallback((e) => {
    if (e) e.stopPropagation();
    if (total <= 1) return;
    setCurrentIndex(prev => {
      const next = (prev - 1 + total) % total;
      onChangeIndex?.(next);
      return next;
    });
  }, [total, onChangeIndex]);

  // ── Keyboard ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") handleClose();
      else if (e.key === "ArrowRight") handleNext();
      else if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleClose, handleNext, handlePrev]);

  // ── Lock scroll ────────────────────────────────────────────────────────────
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // ── Touch Gesture Support ──────────────────────────────────────────────────
  const onTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
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
        handleClose();
      } else {
        doubleTapRef.current = setTimeout(() => {
          doubleTapRef.current = null;
        }, 320);
      }
    }
  };

  if (!currentSrc) return null;

  return (
    <div
      ref={overlayRef}
      className={`lb-overlay lb-overlay--${phase}`}
      onClick={(e) => {
        if (e.target === overlayRef.current) handleClose();
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      role="dialog"
      aria-modal="true"
      aria-label="Image gallery zoom"
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
          onClick={handleClose}
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

      {/* Main Image Stage */}
      <div className="lb-stage">
        <img
          ref={imgRef}
          key={currentSrc}
          className="lb-img"
          src={currentSrc}
          alt={currentAlt}
          draggable={false}
          onDoubleClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
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
