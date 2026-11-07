import React, { useState, useEffect, useRef } from 'react';

/**
 * HeroOverlay — 3-phase hero shared-element transition:
 * 1. PEEL: lifts off carousel card position (object-fit:cover)
 * 2. FLY: animates position + size to gallery slot
 * 3. LAND: glow pulse, then fade out revealing gallery image
 *
 * Uses left/top/width/height CSS transitions so object-fit:cover
 * is preserved throughout — no non-uniform scale stretch.
 */
export default function HeroOverlay({ heroTransition, toRect, phase, onLandDone }) {
  const [style, setStyle] = useState(null);
  const landTimerRef = useRef(null);
  const fromRectRef = useRef(null);

  useEffect(() => {
    if (landTimerRef.current) clearTimeout(landTimerRef.current);

    if (!heroTransition?.src || !heroTransition?.fromRect) {
      setStyle(null);
      fromRectRef.current = null;
      return;
    }

    const r = heroTransition.fromRect;
    if (phase === 'peel') {
      fromRectRef.current = r;
      console.log('[HeroOverlay] peel fromRect:', r.left.toFixed(0), r.top.toFixed(0), r.width.toFixed(0), r.height.toFixed(0));
    }
    const fr = fromRectRef.current || r;

    if (phase === 'peel') {
      // Snap to card position instantly
      setStyle({
        position: 'fixed',
        left: `${fr.left}px`,
        top: `${fr.top}px`,
        width: `${fr.width}px`,
        height: `${fr.height}px`,
        objectFit: 'cover',
        borderRadius: '16px',
        zIndex: 9999,
        pointerEvents: 'none',
        boxShadow: '0 4px 15px rgba(0,0,0,0.25)',
        opacity: 1,
        transition: 'none',
        willChange: 'left, top, width, height, box-shadow, opacity',
      });

      // Gỡ ảnh lên: nhấc bổng 3D nhẹ, bóng đổ tách nền, GIỮ NGUYÊN trên màn hình
      requestAnimationFrame(() => {
        setStyle(prev => prev ? {
          ...prev,
          transform: 'perspective(1000px) rotateX(-5deg) rotateY(2deg) scale(1.04) translateY(-10px)',
          transformOrigin: 'center center',
          boxShadow: '0 28px 60px rgba(0,0,0,0.55), 0 0 25px rgba(255,255,255,0.2)',
          transition: 'transform 360ms cubic-bezier(0.16,1,0.3,1), box-shadow 360ms ease',
        } : null);
      });
    }

    if (phase === 'fly' && toRect) {
      console.log('[HeroOverlay] fly toRect:', toRect.left.toFixed(0), toRect.top.toFixed(0), toRect.width.toFixed(0), toRect.height.toFixed(0));
      // Sau khi trang Gallery đã trượt vào, ảnh hạ cánh đáp vào khung slot đích
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setStyle(prev => prev ? {
            ...prev,
            left: `${toRect.left}px`,
            top: `${toRect.top}px`,
            width: `${toRect.width}px`,
            height: `${toRect.height}px`,
            transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1) translateY(0px)',
            borderRadius: '10px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
            transition: [
              'left 550ms cubic-bezier(0.16,1,0.3,1)',
              'top 550ms cubic-bezier(0.16,1,0.3,1)',
              'width 550ms cubic-bezier(0.16,1,0.3,1)',
              'height 550ms cubic-bezier(0.16,1,0.3,1)',
              'transform 550ms cubic-bezier(0.16,1,0.3,1)',
              'box-shadow 550ms ease',
              'border-radius 550ms ease',
            ].join(', '),
          } : null);
        });
      });
    }

    if (phase === 'land' && toRect) {
      // Glow on landing
      setStyle(prev => prev ? {
        ...prev,
        left: `${toRect.left}px`,
        top: `${toRect.top}px`,
        width: `${toRect.width}px`,
        height: `${toRect.height}px`,
        transform: 'scale(1)',
        borderRadius: '8px',
        boxShadow: '0 0 35px rgba(255,255,255,0.95), 0 0 70px rgba(180,210,255,0.5)',
        transition: 'box-shadow 300ms ease',
      } : null);

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
