import { useMemo } from "react";
import { LiquidGlassCarousel } from "./ui/liquid-glass-carousel";
import { buildSrc } from "../utils/cloudinary";

export default function MobileWorksWheelHome({
  categories = [],
  allItems = [],
  onCategorySelect,
  theme = "light",
}) {
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

  const handleActiveChange = (index) => {};
  const handleFocusChange = (focused) => {};

  const isDark = theme === "dark";

  return (
    <div
      className="w-full h-dvh overflow-hidden select-none flex flex-col justify-center items-center relative"
      style={{ background: isDark ? "#060713" : "#ffffff" }}
    >
      {/* Fallback ambient glow background */}
      {isDark && (
        <div className="absolute inset-0 pointer-events-none z-0">
          <div
            className="absolute w-[95vw] h-[95vw] max-w-[650px] max-h-[650px] rounded-full blur-[110px] opacity-75"
            style={{
              top: '-10%',
              left: '-15%',
              background: 'radial-gradient(circle, rgba(62, 42, 138, 0.85) 0%, rgba(35, 20, 85, 0.45) 55%, transparent 75%)',
            }}
          />
          <div
            className="absolute w-[100vw] h-[100vw] max-w-[700px] max-h-[700px] rounded-full blur-[130px] opacity-80"
            style={{
              bottom: '-12%',
              right: '-15%',
              background: 'radial-gradient(circle, rgba(22, 60, 140, 0.9) 0%, rgba(12, 35, 95, 0.5) 60%, transparent 80%)',
            }}
          />
        </div>
      )}

      {/* 3D Liquid Glass Carousel */}
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
