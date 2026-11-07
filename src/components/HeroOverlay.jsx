import React, { useState, useEffect, useRef } from 'react';

/**
 * HeroOverlay — Handles 3-phase transition:
 * 1. PEEL OFF: lifts off carousel with 3D tilt & dramatic shadow
 * 2. FLY: glides to exact slot rect measured in GalleryPage
 * 3. LAND: emits glow pulse on slot, then fades out as gallery image takes over
 */
export default function HeroOverlay({ heroTransition, toRect, phase, onLandDone }) {
  const [style, setStyle] = useState(null);
  const landTimerRef = useRef(null);

  useEffect(() => {
    if (landTimerRef.current) clearTimeout(landTimerRef.current);

    if (!heroTransition?.src || !heroTransition?.fromRect) {
      setStyle(null);
      return;
    }

    const r = heroTransition.fromRect;

    if (phase === 'peel') {
      // Step 1: Initialize at exact card position
      setStyle({
        position: 'fixed',
        left: `${r.left}px`,
        top: `${r.top}px`,
        width: `${r.width}px`,
        height: `${r.height}px`,
        objectFit: 'cover',
        borderRadius: '16px',
        zIndex: 9999,
        pointerEvents: 'none',
        transform: 'perspective(900px) rotateX(0deg) scale(1)',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.25)',
        opacity: 1,
        transition: 'transform 320ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 320ms ease',
        willChange: 'transform, box-shadow',
      });

      // Step 2: Peel & lift upward with dynamic shadow
      requestAnimationFrame(() => {
        setStyle(prev => prev ? {
          ...prev,
          transform: 'perspective(900px) rotateX(-7deg) scale(1.05) translateY(-14px)',
          boxShadow: '0 24px 50px rgba(0, 0, 0, 0.55), 0 0 20px rgba(255, 255, 255, 0.2)',
        } : null);
      });
    }

    if (phase === 'fly' && toRect) {
      // Calculate delta to target slot
      const dx = toRect.left - r.left;
      const dy = toRect.top - r.top;
      const sx = toRect.width / r.width;
      const sy = toRect.height / r.height;

      // Reset transform baseline without peel tilt
      setStyle({
        position: 'fixed',
        left: `${r.left}px`,
        top: `${r.top}px`,
        width: `${r.width}px`,
        height: `${r.height}px`,
        objectFit: 'cover',
        borderRadius: '16px',
        zIndex: 9999,
        pointerEvents: 'none',
        transform: 'perspective(900px) rotateX(0deg) scale(1) translate(0px, 0px)',
        boxShadow: '0 22px 55px rgba(0, 0, 0, 0.45)',
        opacity: 1,
        transition: 'none',
        willChange: 'transform, box-shadow, border-radius',
      });

      // Smooth FLIP flight to destination
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setStyle(prev => prev ? {
            ...prev,
            transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`,
            borderRadius: '10px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
            transition: 'transform 650ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 650ms ease, border-radius 650ms ease',
          } : null);
        });
      });
    }

    if (phase === 'land' && toRect) {
      const dx = toRect.left - r.left;
      const dy = toRect.top - r.top;
      const sx = toRect.width / r.width;
      const sy = toRect.height / r.height;

      // Glow effect on arrival (Option 2 glow pulse)
      setStyle(prev => prev ? {
        ...prev,
        transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`,
        borderRadius: '8px',
        boxShadow: '0 0 35px rgba(255, 255, 255, 0.95), 0 0 70px rgba(180, 210, 255, 0.5)',
        transition: 'box-shadow 300ms ease',
      } : null);

      // Fade out cleanly into gallery image
      landTimerRef.current = setTimeout(() => {
        setStyle(prev => prev ? {
          ...prev,
          opacity: 0,
          transition: 'opacity 250ms ease',
        } : null);

        setTimeout(() => {
          setStyle(null);
          onLandDone?.();
        }, 260);
      }, 350);
    }

    return () => {
      if (landTimerRef.current) clearTimeout(landTimerRef.current);
    };
  }, [phase, toRect, heroTransition, onLandDone]);

  if (!style || !heroTransition?.src) return null;

  return (
    <img
      src={heroTransition.src}
      alt="Hero transition"
      aria-hidden="true"
      style={style}
    />
  );
}
