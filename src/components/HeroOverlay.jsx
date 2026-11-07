import React, { useState, useEffect, useRef } from 'react';

/**
 * HeroOverlay — Handles 3-phase transition:
 * 1. PEEL OFF: lifts off carousel with shadow
 * 2. FLY: glides to exact slot rect measured in GalleryPage
 * 3. LAND: emits glow pulse on slot, then fades out as gallery image takes over
 *
 * Uses transform-only positioning throughout — no left/top changes after mount.
 * This prevents any position "snap" between phases.
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
      // Mount at exact card position using translate — left/top stay 0
      setStyle({
        position: 'fixed',
        left: 0,
        top: 0,
        width: `${r.width}px`,
        height: `${r.height}px`,
        objectFit: 'cover',
        borderRadius: '16px',
        zIndex: 9999,
        pointerEvents: 'none',
        transform: `translate(${r.left}px, ${r.top}px) scale(1)`,
        transformOrigin: 'top left',
        boxShadow: '0 4px 15px rgba(0,0,0,0.25)',
        opacity: 1,
        transition: 'none',
        willChange: 'transform, box-shadow, opacity',
      });

      // Next frame: animate peel upward
      requestAnimationFrame(() => {
        setStyle(prev => prev ? {
          ...prev,
          transform: `translate(${r.left}px, ${r.top - 14}px) scale(1.05)`,
          boxShadow: '0 24px 50px rgba(0,0,0,0.55), 0 0 20px rgba(255,255,255,0.2)',
          transition: 'transform 320ms cubic-bezier(0.16,1,0.3,1), box-shadow 320ms ease',
        } : null);
      });
    }

    if (phase === 'fly' && toRect) {
      // Calculate target transform values
      const sx = toRect.width / r.width;
      const sy = toRect.height / r.height;

      // Fly directly from wherever peel left off — NO position reset
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setStyle(prev => prev ? {
            ...prev,
            transform: `translate(${toRect.left}px, ${toRect.top}px) scale(${sx}, ${sy})`,
            borderRadius: '10px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
            transition: 'transform 650ms cubic-bezier(0.16,1,0.3,1), box-shadow 650ms ease, border-radius 650ms ease',
          } : null);
        });
      });
    }

    if (phase === 'land' && toRect) {
      const sx = toRect.width / r.width;
      const sy = toRect.height / r.height;

      // Glow pulse on landing
      setStyle(prev => prev ? {
        ...prev,
        transform: `translate(${toRect.left}px, ${toRect.top}px) scale(${sx}, ${sy})`,
        borderRadius: '8px',
        boxShadow: '0 0 35px rgba(255,255,255,0.95), 0 0 70px rgba(180,210,255,0.5)',
        transition: 'box-shadow 300ms ease',
      } : null);

      // Fade out into gallery image
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
