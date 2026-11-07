import React, { useState, useEffect, useRef } from 'react';

/**
 * HeroOverlay — Trình diễn chuyển cảnh nghệ thuật:
 * 1. PEEL: Ảnh bóc ra khỏi Carousel, lơ lửng 3D trên màn hình trong khi trang Gallery trượt vào bên dưới.
 * 2. CROP / RESIZE: 2 Góc ngắm thiết kế (Editorial Grippers ⌜ ⌟) xuất hiện ở 2 góc, kéo co giãn bức ảnh vừa khít kích thước thật trong album.
 * 3. LAND: Dán phẳng xuống khung, hiệu ứng viền phát sáng (Glow Pulse), rồi chuyển giao hiển thị cho ảnh Gallery.
 */
export default function HeroOverlay({ heroTransition, toRect, phase, onLandDone }) {
  const [style, setStyle] = useState(null);
  const [cropState, setCropState] = useState({
    active: false,
    adjusting: false,
    visible: false
  });
  const landTimerRef = useRef(null);
  const fromRectRef = useRef(null);

  useEffect(() => {
    if (landTimerRef.current) clearTimeout(landTimerRef.current);

    if (!heroTransition?.src || !heroTransition?.fromRect) {
      setStyle(null);
      fromRectRef.current = null;
      setCropState({ active: false, adjusting: false, visible: false });
      return;
    }

    const r = heroTransition.fromRect;
    if (phase === 'peel') {
      fromRectRef.current = r;
    }
    const fr = fromRectRef.current || r;

    // ── Phase 1: PEEL & FLOAT ──────────────────────────────────────────────
    if (phase === 'peel') {
      setCropState({ active: false, adjusting: false, visible: false });

      // Định vị ngay tại tọa độ thẻ ảnh trong Carousel
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
        willChange: 'left, top, width, height, box-shadow, opacity, transform',
      });

      // Nhấc bổng lơ lửng 3D nhẹ, ghim cố định trên không gian
      requestAnimationFrame(() => {
        setStyle(prev => prev ? {
          ...prev,
          transform: 'perspective(1000px) rotateX(-5deg) rotateY(2deg) scale(1.04) translateY(-8px)',
          transformOrigin: 'center center',
          boxShadow: '0 28px 60px rgba(0,0,0,0.55), 0 0 25px rgba(255,255,255,0.2)',
          transition: 'transform 360ms cubic-bezier(0.16,1,0.3,1), box-shadow 360ms ease',
        } : null);
      });
    }

    // ── Phase 2: FLY & CROP ADJUSTMENT ─────────────────────────────────────
    if (phase === 'fly' && toRect) {
      // Bước 2.1: Bay tới trung tâm vị trí đích nhưng giữ nguyên kích thước ban đầu,
      // 2 Góc ngắm ⌜ ⌟ xuất hiện bám vào 2 góc đối xứng của bức ảnh
      const targetCenterX = toRect.left + toRect.width / 2;
      const targetCenterY = toRect.top + toRect.height / 2;

      // Vị trí pre-snap: Căn giữa theo vị trí đích nhưng kích thước là fr (ảnh gốc)
      const preLeft = targetCenterX - fr.width / 2;
      const preTop = targetCenterY - fr.height / 2;

      setStyle(prev => prev ? {
        ...prev,
        left: `${preLeft}px`,
        top: `${preTop}px`,
        width: `${fr.width}px`,
        height: `${fr.height}px`,
        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1) translateY(0px)',
        borderRadius: '8px',
        boxShadow: '0 20px 45px rgba(0,0,0,0.45)',
        transition: [
          'left 420ms cubic-bezier(0.16,1,0.3,1)',
          'top 420ms cubic-bezier(0.16,1,0.3,1)',
          'transform 420ms cubic-bezier(0.16,1,0.3,1)',
          'box-shadow 420ms ease',
        ].join(', '),
      } : null);

      // Hiển thị 2 con trỏ ngắm căn chỉnh ⌜ ⌟
      const t1 = setTimeout(() => {
        setCropState({ active: true, adjusting: false, visible: true });

        // Bước 2.2: 2 Con trỏ thực hiện thao tác kéo/co ảnh vừa khít kích thước thực tế
        const t2 = setTimeout(() => {
          setCropState(cs => ({ ...cs, adjusting: true }));

          setStyle(prev => prev ? {
            ...prev,
            left: `${toRect.left}px`,
            top: `${toRect.top}px`,
            width: `${toRect.width}px`,
            height: `${toRect.height}px`,
            transition: [
              'left 450ms cubic-bezier(0.2, 0.9, 0.3, 1.1)',
              'top 450ms cubic-bezier(0.2, 0.9, 0.3, 1.1)',
              'width 450ms cubic-bezier(0.2, 0.9, 0.3, 1.1)',
              'height 450ms cubic-bezier(0.2, 0.9, 0.3, 1.1)',
            ].join(', '),
          } : null);

          // Bước 2.3: Ẩn 2 con trỏ sau khi căn chỉnh hoàn tất
          const t3 = setTimeout(() => {
            setCropState(cs => ({ ...cs, visible: false }));
          }, 480);

          return () => clearTimeout(t3);
        }, 150);

        return () => clearTimeout(t2);
      }, 380);

      return () => clearTimeout(t1);
    }

    // ── Phase 3: LAND & GLOW ───────────────────────────────────────────────
    if (phase === 'land' && toRect) {
      setCropState({ active: false, adjusting: false, visible: false });

      // Phát sáng viền (Glow Pulse) khi đã vào đúng khung
      setStyle(prev => prev ? {
        ...prev,
        left: `${toRect.left}px`,
        top: `${toRect.top}px`,
        width: `${toRect.width}px`,
        height: `${toRect.height}px`,
        transform: 'scale(1)',
        borderRadius: '2px',
        boxShadow: '0 0 35px rgba(255, 255, 255, 0.95), 0 0 70px rgba(180, 210, 255, 0.55)',
        transition: 'box-shadow 300ms ease, border-radius 300ms ease',
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
    <div
      style={{
        position: 'fixed',
        left: style.left,
        top: style.top,
        width: style.width,
        height: style.height,
        zIndex: 9999,
        pointerEvents: 'none',
        transition: style.transition,
        transform: style.transform,
        willChange: 'left, top, width, height, transform',
      }}
    >
      {/* Ảnh đang được bóc gỡ & co dãn */}
      <img
        src={heroTransition.src}
        alt="Hero transition"
        aria-hidden="true"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: style.borderRadius || '8px',
          boxShadow: style.boxShadow,
          opacity: style.opacity ?? 1,
          transition: 'box-shadow 300ms ease, opacity 250ms ease, border-radius 300ms ease',
          display: 'block',
        }}
      />

      {/* ── 2 Góc ngắm căn chỉnh Editorial Grippers ⌜ ⌟ ── */}
      {cropState.active && (
        <div
          style={{
            position: 'absolute',
            inset: -4,
            opacity: cropState.visible ? 1 : 0,
            transition: 'opacity 200ms ease',
            pointerEvents: 'none',
          }}
        >
          {/* Góc trên bên trái: ⌜ */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 18,
              height: 18,
              borderTop: '2.5px solid #ffffff',
              borderLeft: '2.5px solid #ffffff',
              filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.8))',
              transform: cropState.adjusting ? 'scale(1.2) translate(-2px, -2px)' : 'scale(1) translate(0, 0)',
              transition: 'transform 300ms cubic-bezier(0.16,1,0.3,1)',
            }}
          />

          {/* Dấu chấm căn tâm ở góc trái */}
          <div
            style={{
              position: 'absolute',
              top: -3,
              left: -3,
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: '#38bdf8',
              boxShadow: '0 0 8px #38bdf8',
            }}
          />

          {/* Góc dưới bên phải: ⌟ */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 18,
              height: 18,
              borderBottom: '2.5px solid #ffffff',
              borderRight: '2.5px solid #ffffff',
              filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.8))',
              transform: cropState.adjusting ? 'scale(1.2) translate(2px, 2px)' : 'scale(1) translate(0, 0)',
              transition: 'transform 300ms cubic-bezier(0.16,1,0.3,1)',
            }}
          />

          {/* Dấu chấm căn tâm ở góc phải */}
          <div
            style={{
              position: 'absolute',
              bottom: -3,
              right: -3,
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: '#38bdf8',
              boxShadow: '0 0 8px #38bdf8',
            }}
          />

          {/* Đường lưới thước ngắm mờ mảnh (Crop Grid Lines) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              border: '1px dashed rgba(255,255,255,0.45)',
              opacity: cropState.adjusting ? 0.8 : 0.3,
              transition: 'opacity 250ms ease',
            }}
          />
        </div>
      )}
    </div>
  );
}
