import React, { useMemo } from "react";
import {
  DraggableCardBody,
  DraggableCardContainer,
} from "./ui/draggable-card";
import "./MobileDraggableHome.css";

export default function MobileDraggableHome({
  categories = [],
  onCategorySelect,
}) {
  // Pre-configured offsets & rotations for a natural scattered photo pile feel on mobile
  const CARD_LAYOUTS = [
    { top: "18%", left: "10%", rotate: -6 },
    { top: "24%", left: "18%", rotate: 5 },
    { top: "32%", left: "12%", rotate: -3 },
    { top: "38%", left: "20%", rotate: 7 },
    { top: "45%", left: "14%", rotate: -5 },
    { top: "52%", left: "16%", rotate: 4 },
    { top: "28%", left: "15%", rotate: -8 },
    { top: "35%", left: "22%", rotate: 6 },
  ];

  const items = useMemo(() => {
    return categories.map((cat, idx) => {
      const coverImg = cat.cover || cat.items?.[0]?.image || "";
      const layout = CARD_LAYOUTS[idx % CARD_LAYOUTS.length];
      return {
        id: cat.id,
        title: cat.label,
        count: `${cat.items?.length || 0} Photos`,
        image: coverImg,
        categoryObj: cat,
        layout,
      };
    });
  }, [categories]);

  return (
    <div className="mobile-draggable-home">
      <DraggableCardContainer className="mobile-draggable-container">
        {/* Subtle background quote / brand statement */}
        <div className="mobile-draggable-bg-quote">
          <p className="mobile-draggable-brand">JUBI SATAKA</p>
          <p className="mobile-draggable-sub">Hold & drag to explore · Tap to view album</p>
        </div>

        {items.map((item, idx) => (
          <DraggableCardBody
            key={item.id || idx}
            className="mobile-draggable-card"
            style={{
              top: item.layout.top,
              left: item.layout.left,
              transform: `rotate(${item.layout.rotate}deg)`,
            }}
            onClick={() => {
              if (item.categoryObj && onCategorySelect) {
                onCategorySelect(item.categoryObj);
              }
            }}
          >
            <div className="mobile-draggable-card-inner">
              <div className="mobile-draggable-img-wrap">
                <img
                  src={item.image}
                  alt={item.title}
                  loading={idx < 3 ? "eager" : "lazy"}
                  className="mobile-draggable-img"
                  draggable={false}
                />
              </div>
              <div className="mobile-draggable-card-meta">
                <h3 className="mobile-draggable-title">{item.title}</h3>
                <span className="mobile-draggable-count">{item.count}</span>
              </div>
            </div>
          </DraggableCardBody>
        ))}
      </DraggableCardContainer>

      {/* Floating bottom hint */}
      <div className="mobile-draggable-bottom-hint">
        <span>Kéo ảnh tự do · Chạm để xem album</span>
      </div>
    </div>
  );
}
