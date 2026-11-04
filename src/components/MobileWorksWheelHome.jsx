import { useMemo } from "react";
import { LiquidGlassCarousel } from "./ui/liquid-glass-carousel";
import { buildSrc } from "../utils/cloudinary";

export default function MobileWorksWheelHome({
  categories = [],
  allItems = [],
  onCategorySelect,
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

      const optimizedImage = coverSrc
        ? buildSrc(coverSrc, { w: 900, dprAuto: true })
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
      // When a card is focused/clicked, navigate to that category
      const activeItem = carouselItems[0]; // focus doesn't expose index directly
      // Navigation happens on click via the carousel's built-in focus behavior
    }
  };

  return (
    <div className="w-full h-dvh overflow-hidden select-none bg-white text-black flex flex-col justify-center items-center relative">
      <LiquidGlassCarousel
        items={carouselItems}
        panelHeight={380}
        gap={12}
        background="#ffffff"
        entry={true}
        onActiveChange={handleActiveChange}
        onFocusChange={handleFocusChange}
        className="w-full h-full"
      />
    </div>
  );
}
