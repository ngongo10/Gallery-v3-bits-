import { useMemo } from "react";
import { LiquidGlassCarousel } from "./ui/liquid-glass-carousel";
import { LivingOrigamiBg } from "./ui/living-origami-bg";
import { buildSrc } from "../utils/cloudinary";

export default function MobileWorksWheelHome({
  categories = [],
  allItems = [],
  onCategorySelect,
  theme = "light",
}) {
  // Build carousel items from portfolio categories
  const carouselItems = useMemo(() => {
    const artCats = categories.filter((c) => c.mode === "art");
    const sourceCats = artCats.length > 0 ? artCats : categories;

    return sourceCats.map((cat) => {
      const coverSrc =
        cat.cover ||
        cat.items?.[0]?.image ||
        allItems.find((i) => i.category === cat.id)?.image ||
        "";

      // Crop anh theo ty le 3:4 (portrait)
      const optimizedImage = coverSrc
        ? buildSrc(coverSrc, { w: 900, h: 1200, crop: "fill", dprAuto: true })
        : "";

      return {
        src: optimizedImage,
        alt: cat.label || "Portfolio item",
        title: cat.label,
        aspect: 3 / 4,
        _categoryObj: cat,
      };
    });
  }, [categories, allItems]);

  const handleActiveChange = (index) => {
    // Optional: handle active slide change
  };

  const handleFocusChange = (focused) => {
    if (focused) {
      // Navigate on focus
    }
  };

  const isDark = theme === "dark";

  return (
    <div
      className="w-full h-dvh overflow-hidden select-none flex flex-col justify-center items-center relative"
      style={{ background: isDark ? "#060713" : "#ffffff" }}
    >
      {/* Dark Ambient Gradient Mesh matching user design */}
      {isDark && <LivingOrigamiBg className="z-0" />}

      {/* 3D Liquid Glass Carousel on top with transparent canvas */}
      <div className="relative z-10 w-full h-full">
        <LiquidGlassCarousel
          items={carouselItems}
          panelHeight={380}
          gap={12}
          background="transparent"
                    entry={true}
          onActiveChange={handleActiveChange}
          onFocusChange={handleFocusChange}
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
