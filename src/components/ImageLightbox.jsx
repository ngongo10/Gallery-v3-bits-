import { useEffect, useRef, useCallback } from "react";
import "./ImageLightbox.css";

export default function ImageLightbox({ src, alt, onClose }) {
  const overlayRef = useRef(null);
  const doubleTapTimer = useRef(null);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Prevent background scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const handleOverlayClick = useCallback((e) => {
    if (e.target === overlayRef.current) onClose();
  }, [onClose]);

  // Double-click to close (Desktop)
  const handleImageDoubleClick = useCallback((e) => {
    e.stopPropagation();
    onClose();
  }, [onClose]);

  // Double-tap to close (Mobile Touch)
  const handleImageTouchEnd = useCallback((e) => {
    e.stopPropagation();
    if (doubleTapTimer.current) {
      clearTimeout(doubleTapTimer.current);
      doubleTapTimer.current = null;
      onClose();
    } else {
      doubleTapTimer.current = setTimeout(() => {
        doubleTapTimer.current = null;
      }, 350);
    }
  }, [onClose]);

  if (!src) return null;

  return (
    <div
      ref={overlayRef}
      className="lb-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Image zoom"
    >
      <button className="lb-close" onClick={onClose} aria-label="Close">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </button>
      <img
        className="lb-img"
        src={src}
        alt={alt || ""}
        draggable={false}
        onDoubleClick={handleImageDoubleClick}
        onTouchEnd={handleImageTouchEnd}
      />
      <p className="lb-hint">Nhấn đúp hoặc chạm ngoài ảnh để đóng</p>
    </div>
  );
}
