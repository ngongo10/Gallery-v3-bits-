import React, { useMemo, useState } from "react";
import DiscCascadeCarousel from "./ui/disc-cascade-carousel";
import ImageLightbox from "./ImageLightbox";
import { ArrowUpRight } from "lucide-react";
import { buildSrc } from "../utils/cloudinary";

export default function MobileDiscHome({
  categories = [],
  allItems = [],
  onCategorySelect,
  theme = "dark",
}) {
  const [activeLightbox, setActiveLightbox] = useState(null);

  // Chuẩn bị dữ liệu các đĩa Vinyl từ các album ART
  const discRecords = useMemo(() => {
    const artCats = categories.filter((c) => c.mode === "art");
    const sourceCats = artCats.length > 0 ? artCats : categories;

    const PALETTES_MAP = [
      ["#1b1d1f", "#3f6b3a", "#c9d6c4"],
      ["#141414", "#d2452b", "#2a5d8f"],
      ["#18181c", "#e9e4da", "#c8a24a"],
      ["#2d3f7a", "#e8b4c8", "#f4efe6"],
      ["#16443f", "#f0c94c", "#e8572b"],
    ];

    const PATTERNS_MAP = ["horizon", "sunburst", "eclipse", "mosaic", "halftone"];

    return sourceCats.map((cat, idx) => {
      const items = (cat.items && cat.items.length > 0)
        ? cat.items.filter((i) => i.image)
        : allItems.filter((i) => i.category === cat.id && i.image);

      const coverSrc = cat.cover || items[0]?.image || "";
      const optimizedCover = coverSrc ? buildSrc(coverSrc, { w: 600, dprAuto: true }) : undefined;

      return {
        title: cat.label,
        categoryObj: cat,
        items,
        src: optimizedCover,
        alt: cat.label,
        pattern: PATTERNS_MAP[idx % PATTERNS_MAP.length],
        palette: PALETTES_MAP[idx % PALETTES_MAP.length],
        label: cat.label,
        labelStyle: "arc",
        credits: [
          { label: "Album", value: `#${idx + 1}` },
          { label: "Photos", value: `${items.length} works` },
          { label: "Genre", value: "Photography" },
        ],
        reviews: [
          { source: "Jubi Sataka", quote: `Bộ sưu tập ${cat.label}`, stars: 5 },
          { source: "Curator", quote: "Chạm để xem ảnh toàn màn hình", stars: 5 },
        ],
      };
    });
  }, [categories, allItems]);

  const handleSelectDisc = (item, index) => {
    // Khi bấm vào đĩa đĩa đang được chọn (active disc), mở Lightbox xem ảnh
    if (item.items && item.items.length > 0) {
      setActiveLightbox({
        items: item.items,
        index: 0,
        category: item.categoryObj,
      });
    } else if (item.categoryObj) {
      onCategorySelect?.(item.categoryObj);
    }
  };

  const isDark = theme === "dark";

  return (
    <div className="relative w-full h-[100svh] overflow-hidden select-none">
      <DiscCascadeCarousel
        items={discRecords}
        brand="JUBI / ART"
        nav={[{ label: "Albums" }]}
        indexLabel="Mục lục"
        defaultIndex={0}
        loop={true}
        discSize="clamp(190px, 58vw, 320px)"
        spacing={0.92}
        rise={0.22}
        depth={0.4}
        yaw={22}
        tilt={-5}
        roll={105}
        sheen={0.65}
        spin={20}
        duration={0.85}
        background={
          isDark
            ? "radial-gradient(130% 90% at 50% 40%, #16171b, #050507)"
            : "radial-gradient(130% 90% at 50% 40%, #222328, #0e0f12)"
        }
        color="#f3f2ee"
        fontHref="https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Inter:wght@400;600;800&family=Oswald:wght@600;700&display=swap"
        hint="Vuốt đĩa để duyệt • Chạm để mở"
        ariaLabel="Album vinyl catalogue"
        onSelect={handleSelectDisc}
      />

      {/* Nút hành động nhanh ở góc trên/dưới mở thư viện */}
      {activeLightbox && (
        <ImageLightbox
          items={activeLightbox.items}
          initialIndex={activeLightbox.index}
          onClose={() => setActiveLightbox(null)}
          actionButton={
            activeLightbox.category ? (
              <button
                type="button"
                className="mch-lightbox-gallery-btn"
                onClick={() => {
                  const cat = activeLightbox.category;
                  setActiveLightbox(null);
                  onCategorySelect?.(cat);
                }}
              >
                <span>Xem toàn bộ album {activeLightbox.category.label}</span>
                <ArrowUpRight size={15} aria-hidden="true" />
              </button>
            ) : null
          }
        />
      )}
    </div>
  );
}
