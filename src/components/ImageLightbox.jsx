import { useEffect, useRef, useCallback } from "react";
import "./ImageLightbox.css";

export default function ImageLightbox({ src, alt, onClose }) {
  const overlayRef = useRef(null);

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
      />
      <p className="lb-hint">ESC hoặc nhấn ngoài ảnh để đóng</p>
    </div>
  );
}
