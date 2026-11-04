import { useMemo } from "react";
import { LiquidGlassCarousel } from "./ui/liquid-glass-carousel";
import { Particles } from "./ui/Particles";
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
      {/* Dynamic Animated Particles Background from React Bits */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <Particles
          particleColors={isDark ? ["#ffffff", "#eefffb", "#70b5ff"] : ["#1a202c", "#2d3748", "#4a5568"]}
          particleCount={290}
          particleSpread={9}
          speed={0.1}
          particleBaseSize={90}
          glow={isDark ? 0.65 : 0.2}
          twinkle={0.3}
          moveParticlesOnHover={false}
          hoverEffect="parallax"
          depthOfField={0.15}
          clickBurst={false}
          lightMode={!isDark}
          className="w-full h-full"
        />
      </div>

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
