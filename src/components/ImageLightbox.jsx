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
  const galleryItems = items.length > 0
    ? items
    : src ? [{ image: src, caption: alt || "" }] : [];

  const [currentIndex, setCurrentIndex] = useState(() =>
    initialIndex >= 0 && initialIndex < galleryItems.length ? initialIndex : 0
  );

  // "entering" -> "entered" -> "leaving"
  const [phase, setPhase] = useState("entering");
  const overlayRef   = useRef(null);
  const stageRef     = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const touchDeltaRef = useRef({ x: 0, y: 0 });
  const doubleTapRef  = useRef(null);
  const isSwiping     = useRef(false);
  const closingRef    = useRef(false);

  const total       = galleryItems.length;
  const currentItem = galleryItems[currentIndex] || {};
  const currentSrc  = currentItem.image || currentItem.src || src;
  const currentAlt  = currentItem.caption || currentItem.alt || alt || `Photo ${currentIndex + 1}`;

  // ── Compute transform so stage starts at thumbnail position ──────────────
  const getOriginTransform = useCallback(() => {
    if (!originRect) return null;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // Center of thumbnail
    const ox = originRect.left + originRect.width  / 2;
    const oy = originRect.top  + originRect.height / 2;
    // Center of viewport
    const cx = vw / 2;
    const cy = vh / 2;
    // Translation needed
    const dx = ox - cx;
    const dy = oy - cy;
    // Scale: thumbnail height vs viewport height (keep it simple & stable)
    const s = Math.min(originRect.width / vw, originRect.height / vh) * 2.2;
    return `translate(${dx}px, ${dy}px) scale(${Math.max(s, 0.05)})`;
  }, [originRect]);

  // ── Mount: kick opening animation ────────────────────────────────────────
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !originRect) {
      setPhase("entered");
      return;
    }
    const t = getOriginTransform();
    // Snap to origin instantly (no transition)
    stage.style.transition = "none";
    stage.style.transform  = t;
    // Force reflow then start transition
    void stage.offsetWidth;
    stage.style.transition = "transform 0.46s cubic-bezier(0.32, 0.72, 0, 1)";
    stage.style.transform  = "translate(0,0) scale(1)";

    const tid = setTimeout(() => setPhase("entered"), 460);
    return () => clearTimeout(tid);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Close handler: reverse animate then unmount ───────────────────────────
  const handleClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    const stage = stageRef.current;
    if (stage && originRect) {
      const t = getOriginTransform();
      stage.style.transition = "transform 0.38s cubic-bezier(0.4, 0, 1, 1)";
      stage.style.transform  = t;
      // Also fade overlay out
      if (overlayRef.current) {
        overlayRef.current.style.transition = "opacity 0.38s ease";
        overlayRef.current.style.opacity = "0";
      }
      setTimeout(() => onClose(), 390);
    } else {
      onClose();
    }
  }, [originRect, getOriginTransform, onClose]);

  // ── Navigation ────────────────────────────────────────────────────────────
  const handleNext = useCallback((e) => {
    if (e) e.stopPropagation();
    if (total <= 1) return;
    setCurrentIndex(prev => { const n = (prev + 1) % total; onChangeIndex?.(n); return n; });
  }, [total, onChangeIndex]);

  const handlePrev = useCallback((e) => {
    if (e) e.stopPropagation();
    if (total <= 1) return;
    setCurrentIndex(prev => { const n = (prev - 1 + total) % total; onChangeIndex?.(n); return n; });
  }, [total, onChangeIndex]);

  // ── Keyboard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const fn = (e) => {
      if (e.key === "Escape")      handleClose();
      else if (e.key === "ArrowRight") handleNext();
      else if (e.key === "ArrowLeft")  handlePrev();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [handleClose, handleNext, handlePrev]);

  // ── Lock scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // ── Touch ─────────────────────────────────────────────────────────────────
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
    const ax = Math.abs(dx), ay = Math.abs(dy);
    if (ax > 45 && ax > ay) { dx < 0 ? handleNext() : handlePrev(); return; }
    if (ax < 10 && ay < 10) {
      if (doubleTapRef.current) {
        clearTimeout(doubleTapRef.current);
        doubleTapRef.current = null;
        handleClose();
      } else {
        doubleTapRef.current = setTimeout(() => { doubleTapRef.current = null; }, 320);
      }
    }
  };

  if (!currentSrc) return null;

  return (
    <div
      ref={overlayRef}
      className={`lb-overlay lb-overlay--${phase}`}
      onClick={(e) => { if (e.target === overlayRef.current) handleClose(); }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
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
        <button type="button" className="lb-close" onClick={handleClose} aria-label="Dong">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Arrows */}
      {total > 1 && (
        <>
          <button type="button" className="lb-arrow lb-arrow--prev" onClick={handlePrev} aria-label="Anh truoc">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button type="button" className="lb-arrow lb-arrow--next" onClick={handleNext} aria-label="Anh tiep theo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </>
      )}

      {/* Stage — this element gets the magic transform animation */}
      <div className="lb-stage" ref={stageRef}>
        <img
          key={currentSrc}
          className="lb-img"
          src={currentSrc}
          alt={currentAlt}
          draggable={false}
          onDoubleClick={(e) => { e.stopPropagation(); handleClose(); }}
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
        <p className="lb-hint">Vuot hoac dung mui ten de chuyen anh • Nhan dup de dong</p>
      </div>
    </div>
  );
}
