import React, { useMemo } from "react";
import { WorksWheel } from "./ui/works-wheel";
import { buildSrc } from "../utils/cloudinary";

export default function MobileWorksWheelHome({
  categories = [],
  allItems = [],
  onCategorySelect,
}) {
  // Lấy các album ART (hoặc toàn bộ categories)
  const wheelItems = useMemo(() => {
    const artCats = categories.filter((c) => c.mode === "art");
    const sourceCats = artCats.length > 0 ? artCats : categories;

    return sourceCats.map((cat) => {
      const coverSrc =
        cat.cover ||
        cat.items?.[0]?.image ||
        allItems.find((i) => i.category === cat.id)?.image ||
        "";

      const optimizedImage = coverSrc
        ? buildSrc(coverSrc, { w: 600, dprAuto: true })
        : "";

      return {
        title: cat.label,
        image: optimizedImage,
        categoryObj: cat,
      };
    });
  }, [categories, allItems]);

  const handleItemClick = (item) => {
    // Điều hướng vào album/gallery trực tiếp như bình thường
    if (item.categoryObj) {
      onCategorySelect?.(item.categoryObj);
    }
  };

  return (
    <div className="w-full h-dvh overflow-hidden select-none bg-[#0a0a0c] text-white">
      <WorksWheel
        items={wheelItems}
        label="JUBI '26"
        action=""
        onItemClick={handleItemClick}
        className="w-full h-full bg-[#0a0a0c]"
      />
    </div>
  );
}
