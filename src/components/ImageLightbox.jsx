import { useEffect, useRef, useState, useCallback } from "react";
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
  // Normalize items
  const galleryItems = items.length > 0
    ? items
    : src
      ? [{ image: src, caption: alt || "" }]
      : [];

  const [currentIndex, setCurrentIndex] = useState(() => {
    if (initialIndex >= 0 && initialIndex < galleryItems.length) {
      return initialIndex;
    }
    return 0;
  });

  // Magic zoom state: "opening" | "open" | "closing"
  const [magicState, setMagicState] = useState("opening");
  const overlayRef = useRef(null);
  const stageRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const touchDeltaRef = useRef({ x: 0, y: 0 });
  const doubleTapTimer = useRef(null);
  const isSwipingRef = useRef(false);

  const total = galleryItems.length;
  const currentItem = galleryItems[currentIndex] || {};
  const currentSrc = currentItem.image || currentItem.src || src;
  const currentAlt = currentItem.caption || currentItem.alt || alt || `Photo ${currentIndex + 1}`;

  // ─── Magic Zoom: compute inset clip-path from originRect ─────────────────
  const getOriginClip = useCallback(() => {
    if (!originRect) return null;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const top    = ((originRect.top    / vh) * 100).toFixed(2);
    const bottom = (((vh - originRect.bottom) / vh) * 100).toFixed(2);
    const left   = ((originRect.left   / vw) * 100).toFixed(2);
    const right  = (((vw - originRect.right)  / vw) * 100).toFixed(2);
    return `inset(${top}% ${right}% ${bottom}% ${left}% round 8px)`;
  }, [originRect]);

  // On mount: kick off open animation
  useEffect(() => {
    if (!originRect) {
      setMagicState("open");
      return;
    }
    setMagicState("opening");
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setMagicState("open");
      });
    });
    return () => cancelAnimationFrame(raf);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Close with reverse animation ────────────────────────────────────────
  const handleClose = useCallback(() => {
    if (!originRect) {
      onClose();
      return;
    }
    setMagicState("closing");
    setTimeout(() => onClose(), 400);
  }, [originRect, onClose]);

  // Next / Prev
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

  // Keyboard
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape")      { handleClose(); }
      else if (e.key === "ArrowRight") { handleNext(); }
      else if (e.key === "ArrowLeft")  { handlePrev(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleClose, handleNext, handlePrev]);

  // Lock scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Overlay backdrop click
  const handleOverlayClick = useCallback((e) => {
    if (e.target === overlayRef.current) handleClose();
  }, [handleClose]);

  // Double-click image to close
  const handleImageDoubleClick = useCallback((e) => {
    e.stopPropagation();
    handleClose();
  }, [handleClose]);

  // Touch
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      const t = e.touches[0];
      touchStartRef.current = { x: t.clientX, y: t.clientY, time: Date.now() };
      touchDeltaRef.current = { x: 0, y: 0 };
      isSwipingRef.current = true;
    }
  };
  const handleTouchMove = (e) => {
    if (!isSwipingRef.current || e.touches.length !== 1) return;
    const t = e.touches[0];
    touchDeltaRef.current = {
      x: t.clientX - touchStartRef.current.x,
      y: t.clientY - touchStartRef.current.y,
    };
  };
  const handleTouchEnd = () => {
    if (!isSwipingRef.current) return;
    isSwipingRef.current = false;
    const { x: dx, y: dy } = touchDeltaRef.current;
    const ax = Math.abs(dx), ay = Math.abs(dy);
    if (ax > 45 && ax > ay) { dx < 0 ? handleNext() : handlePrev(); return; }
    if (ax < 10 && ay < 10) {
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

  // ─── Build inline style for magic clip ───────────────────────────────────
  const originClip = getOriginClip();
  const isAnimating = originClip && (magicState === "opening" || magicState === "closing");
  const overlayStyle = isAnimating
    ? {
        clipPath: originClip,
        backgroundColor: "rgba(0,0,0,0.08)",
        backdropFilter: "blur(0px)",
        WebkitBackdropFilter: "blur(0px)",
      }
    : {};

  return (
    <div
      ref={overlayRef}
      className={`lb-overlay lb-overlay--${magicState}`}
      style={overlayStyle}
      onClick={handleOverlayClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="dialog"
      aria-modal="true"
      aria-label="Image gallery zoom"
    >
      {/* Header */}
      <div className="lb-header">
        {total > 1 && (
          <div className="lb-counter">
            <span>{currentIndex + 1}</span>
            <span className="lb-counter-sep">/</span>
            <span>{total}</span>
          </div>
        )}
        <button type="button" className="lb-close" onClick={handleClose} aria-label="Đóng">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Arrows */}
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

      {/* Image Stage */}
      <div className="lb-stage" ref={stageRef}>
        <img
          key={currentSrc}
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
        {currentItem.storyText
          ? <p className="lb-caption">{currentItem.storyText}</p>
          : currentItem.caption
            ? <p className="lb-caption">{currentItem.caption}</p>
            : null}
        <p className="lb-hint">Vuốt hoặc dùng mũi tên để chuyển ảnh • Nhấn đúp để đóng</p>
      </div>
    </div>
  );
}
