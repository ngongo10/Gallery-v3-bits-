import React, { useMemo, useState } from "react";
import {
  DraggableCardBody,
  DraggableCardContainer,
} from "./ui/draggable-card";
import ImageLightbox from "./ImageLightbox";
import "./MobileDraggableHome.css";

export default function MobileDraggableHome({
  items = [],
}) {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Pre-configured scattered positions across the viewport
  const CARD_LAYOUTS = [
    { top: "16%", left: "12%", rotate: -6 },
    { top: "22%", left: "18%", rotate: 5 },
    { top: "30%", left: "10%", rotate: -4 },
    { top: "36%", left: "22%", rotate: 7 },
    { top: "42%", left: "14%", rotate: -7 },
    { top: "48%", left: "20%", rotate: 4 },
    { top: "26%", left: "16%", rotate: -8 },
    { top: "34%", left: "11%", rotate: 6 },
    { top: "40%", left: "17%", rotate: -3 },
    { top: "20%", left: "24%", rotate: 8 },
    { top: "46%", left: "13%", rotate: -5 },
    { top: "28%", left: "21%", rotate: 3 },
  ];

  const cards = useMemo(() => {
    return items.map((item, idx) => {
      const layout = CARD_LAYOUTS[idx % CARD_LAYOUTS.length];
      return {
        ...item,
        layout,
      };
    });
  }, [items]);

  return (
    <div className="mobile-draggable-home">
      <DraggableCardContainer className="mobile-draggable-container">
        {/* Subtle background quote / brand statement */}
        <div className="mobile-draggable-bg-quote">
          <p className="mobile-draggable-brand">JUBI SATAKA</p>
          <p className="mobile-draggable-sub">
            Hold & drag to explore · Tap photo to zoom
          </p>
        </div>

        {cards.map((item, idx) => (
          <DraggableCardBody
            key={item.id || idx}
            className="mobile-draggable-card"
            style={{
              top: item.layout.top,
              left: item.layout.left,
              transform: `rotate(${item.layout.rotate}deg)`,
              zIndex: idx + 5,
            }}
            onClick={() => {
              setLightboxIndex(idx);
            }}
          >
            <div className="mobile-draggable-card-inner">
              <div className="mobile-draggable-img-wrap">
                <img
                  src={item.image}
                  alt={item.title || item.caption || `Photo ${idx + 1}`}
                  loading={idx < 4 ? "eager" : "lazy"}
                  className="mobile-draggable-img"
                  draggable={false}
                />
              </div>
              <div className="mobile-draggable-card-meta">
                <h3 className="mobile-draggable-title">
                  {item.title || item.caption || `Ảnh #${idx + 1}`}
                </h3>
                {item.categoryLabel && (
                  <span className="mobile-draggable-count">
                    {item.categoryLabel}
                  </span>
                )}
              </div>
            </div>
          </DraggableCardBody>
        ))}
      </DraggableCardContainer>

      {/* Floating bottom hint */}
      <div className="mobile-draggable-bottom-hint">
        <span>Kéo ảnh tự do · Chạm ảnh để phóng to</span>
      </div>

      {/* Lightbox for zooming photos on tap */}
      {lightboxIndex !== null && (
        <ImageLightbox
          items={items}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onChangeIndex={(idx) => setLightboxIndex(idx)}
        />
      )}
    </div>
  );
}
