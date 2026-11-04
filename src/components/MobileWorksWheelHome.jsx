import React, { useMemo } from "react";
import FlexCarousel from "./FlexCarousel";
import { buildSrc } from "../utils/cloudinary";

export default function MobileWorksWheelHome({
  categories = [],
  allItems = [],
  onCategorySelect,
}) {
  // Lấy danh sách items cho FlexCarousel từ categories portfolio
  const carouselItems = useMemo(() => {
    const artCats = categories.filter((c) => c.mode === "art");
    const sourceCats = artCats.length > 0 ? artCats : categories;

    return sourceCats.map((cat) => {
      const coverSrc =
        cat.cover ||
        cat.items?.[0]?.image ||
        allItems.find((i) => i.category === cat.id)?.image ||
        "";

      const optimizedImage = coverSrc
        ? buildSrc(coverSrc, { w: 900, dprAuto: true })
        : "";

      return {
        src: optimizedImage,
        alt: cat.label || "Portfolio item",
        title: cat.label,
        subtitle: cat.description ? cat.description.slice(0, 32) + "..." : "JUBI SATAKA",
        categoryObj: cat,
      };
    });
  }, [categories, allItems]);

  const handleSelect = (index, item) => {
    if (item?.categoryObj) {
      onCategorySelect?.(item.categoryObj);
    }
  };

  return (
    <div className="w-full h-dvh overflow-hidden select-none bg-[#0a0a0c] text-white flex flex-col justify-center items-center relative">
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <FlexCarousel
          items={carouselItems}
          preset="liquid"
          intro="rise"
          cardHeight={0.52}
          gap={12}
          squeeze={0.2}
          focusOnClick
          captions
          onSelect={handleSelect}
        />
      </div>
    </div>
  );
}
