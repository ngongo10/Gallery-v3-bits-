import { useEffect, useRef, useState, useCallback } from "react";
import "./ImageLightbox.css";

export default function ImageLightbox({
  items = [],
  initialIndex = 0,
  src,
  alt,
  onClose,
  onChangeIndex,
  actionButton
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

  const overlayRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const touchDeltaRef = useRef({ x: 0, y: 0 });
  const doubleTapTimer = useRef(null);
  const isSwipingRef = useRef(false);

  const total = galleryItems.length;
  const currentItem = galleryItems[currentIndex] || {};
  const currentSrc = currentItem.image || currentItem.src || src;
  const currentAlt = currentItem.caption || currentItem.alt || alt || `Photo ${currentIndex + 1}`;

  // Next / Prev handlers
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

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, handleNext, handlePrev]);

  // Prevent background scrolling
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Overlay click to close
  const handleOverlayClick = useCallback((e) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  }, [onClose]);

  // Double-click to close (Desktop)
  const handleImageDoubleClick = useCallback((e) => {
    e.stopPropagation();
    onClose();
  }, [onClose]);

  // Touch Swipe & Double-tap Handlers
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };
      touchDeltaRef.current = { x: 0, y: 0 };
      isSwipingRef.current = true;
    }
  };

  const handleTouchMove = (e) => {
    if (!isSwipingRef.current || e.touches.length !== 1) return;
    const touch = e.touches[0];
    touchDeltaRef.current = {
      x: touch.clientX - touchStartRef.current.x,
      y: touch.clientY - touchStartRef.current.y
    };
  };

  const handleTouchEnd = (e) => {
    if (!isSwipingRef.current) return;
    isSwipingRef.current = false;

    const deltaX = touchDeltaRef.current.x;
    const deltaY = touchDeltaRef.current.y;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // If swipe horizontal > 45px and more horizontal than vertical
    if (absX > 45 && absX > absY) {
      if (deltaX < 0) {
        // Swiped Left -> Go Next
        handleNext();
      } else {
        // Swiped Right -> Go Prev
        handlePrev();
      }
      return;
    }

    // Double-tap to close detection
    if (absX < 10 && absY < 10) {
      if (doubleTapTimer.current) {
        clearTimeout(doubleTapTimer.current);
        doubleTapTimer.current = null;
        onClose();
      } else {
        doubleTapTimer.current = setTimeout(() => {
          doubleTapTimer.current = null;
        }, 320);
      }
    }
  };

  if (!currentSrc) return null;

  return (
    <div
      ref={overlayRef}
      className="lb-overlay"
      onClick={handleOverlayClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="dialog"
      aria-modal="true"
      aria-label="Image gallery zoom"
    >
      {/* Top Header Bar: Counter & Close */}
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
          aria-label="Đóng (Close)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6 6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
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
              <path
                d="M15 19l-7-7 7-7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <button
            type="button"
            className="lb-arrow lb-arrow--next"
            onClick={handleNext}
            aria-label="Ảnh tiếp theo"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 5l7 7-7 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </>
      )}

      {/* Main Image Stage */}
      <div className="lb-stage">
        <img
          key={currentSrc}
          className="lb-img"
          src={currentSrc}
          alt={currentAlt}
          draggable={false}
          onDoubleClick={handleImageDoubleClick}
        />
      </div>

      {/* Bottom Footer: Hint, Action Button, Caption */}
      <div className="lb-footer">
        {actionButton && (
          <div className="lb-action-wrap">
            {actionButton}
          </div>
        )}
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
