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

    // ── Phase 1: PEEL & FLOAT (Tự nhiên, không chói sáng) ───────────────────
    if (phase === 'peel') {
      setCropState({ active: false, adjusting: false, visible: false });

      // Định vị ngay tại tọa độ thẻ ảnh trong Carousel
      setStyle({
        position: 'fixed',
        left: `${fr.left}px`,
        top: `${fr.top}px`,
        width: `${fr.width}px`,
        height: `${fr.height}px`,
        objectFit: 'contain',
        borderRadius: '16px',
        zIndex: 9999,
        pointerEvents: 'none',
        boxShadow: '0 8px 25px rgba(0,0,0,0.25)',
        filter: 'none',
        opacity: 1,
        transition: 'none',
        willChange: 'left, top, width, height, box-shadow, opacity, transform',
      });

      // Nhấc lơ lửng nhẹ nhàng, màu sắc trung thực gốc
      requestAnimationFrame(() => {
        setStyle(prev => prev ? {
          ...prev,
          transform: 'scale(1.04) translateY(-6px)',
          transformOrigin: 'center center',
          boxShadow: '0 18px 45px rgba(0,0,0,0.35)',
          filter: 'none',
          transition: 'transform 360ms cubic-bezier(0.16,1,0.3,1), box-shadow 360ms ease',
        } : null);
      });
    }

    // ── Phase 2: FLY & CROP ADJUSTMENT (Con trỏ xuất hiện VÀ ngắm CO DÃN TRONG LÚC ZOOM) ────
    if (phase === 'fly' && toRect) {
      // Bật 2 con trỏ ngắm ngay lập tức khi bắt đầu di chuyển
      setCropState({ active: true, adjusting: false, visible: true });

      // Kích hoạt co dãn kích thước đồng thời cùng 2 con trỏ
      requestAnimationFrame(() => {
        // Con trỏ căng góc co dãn
        setCropState(cs => ({ ...cs, adjusting: true }));

        // Cả khung ảnh vừa bay vừa zoom co kích thước về đúng kích thước ảnh gốc
        setStyle(prev => prev ? {
          ...prev,
          left: `${toRect.left}px`,
          top: `${toRect.top}px`,
          width: `${toRect.width}px`,
          height: `${toRect.height}px`,
          transform: 'scale(1) translateY(0px)',
          borderRadius: '4px',
          boxShadow: '0 15px 35px rgba(0,0,0,0.35)',
          filter: 'brightness(1) contrast(1)',
          transition: [
            'left 520ms cubic-bezier(0.2, 0.9, 0.3, 1.05)',
            'top 520ms cubic-bezier(0.2, 0.9, 0.3, 1.05)',
            'width 520ms cubic-bezier(0.2, 0.9, 0.3, 1.05)',
            'height 520ms cubic-bezier(0.2, 0.9, 0.3, 1.05)',
            'transform 520ms cubic-bezier(0.2, 0.9, 0.3, 1.05)',
            'filter 520ms ease',
            'box-shadow 520ms ease',
            'border-radius 520ms ease',
          ].join(', '),
        } : null);
      });

      // Khi kết thúc hành trình bay & zoom (khoảng 520ms), ẩn 2 con trỏ ngắm
      const t1 = setTimeout(() => {
        setCropState(cs => ({ ...cs, visible: false }));
      }, 540);

      return () => clearTimeout(t1);
    }

    // ── Phase 3: LAND (Đáp phẳng tĩnh lặng, không chói lóa) ───────────────
    if (phase === 'land' && toRect) {
      setCropState({ active: false, adjusting: false, visible: false });

      // Định vị phẳng tự nhiên không bóng chói
      setStyle(prev => prev ? {
        ...prev,
        left: `${toRect.left}px`,
        top: `${toRect.top}px`,
        width: `${toRect.width}px`,
        height: `${toRect.height}px`,
        transform: 'scale(1)',
        borderRadius: '2px',
        boxShadow: 'none',
        filter: 'none',
        transition: 'border-radius 200ms ease',
      } : null);

      landTimerRef.current = setTimeout(() => {
        setStyle(prev => prev ? {
          ...prev,
          opacity: 0,
          transition: 'opacity 180ms ease',
        } : null);
        setTimeout(() => {
          setStyle(null);
          onLandDone?.();
        }, 190);
      }, 150);
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
        src={heroTransition.rawCover || heroTransition.src}
        alt="Hero transition"
        aria-hidden="true"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          borderRadius: style.borderRadius || '8px',
          boxShadow: style.boxShadow,
          filter: style.filter,
          opacity: style.opacity ?? 1,
          transition: 'box-shadow 300ms ease, opacity 250ms ease, border-radius 300ms ease, filter 450ms ease',
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
