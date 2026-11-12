import { useMemo, useRef, useEffect } from "react";
import { FlexCarousel } from "./FlexCarousel";
import { Particles } from "./ui/Particles";
import { buildSrc } from "../utils/cloudinary";

export default function MobileWorksWheelHome({
  categories = [],
  allItems = [],
  onCategorySelect,
  isExiting = false,
  theme = "light",
}) {
  const carouselRef = useRef(null);

  useEffect(() => {
    // Khi người dùng bấm BACK từ Gallery về Home, reset lại trạng thái focus
    // để 2 ảnh hai bên khép lại và toàn bộ carousel trở lại bình thường
    if (!isExiting && carouselRef.current?.resetFocus) {
      carouselRef.current.resetFocus();
    }
  }, [isExiting]);
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
        category: cat,
      };
    });
  }, [categories, allItems]);

  const isDark = theme === "dark";

  return (
    <div
      className="w-full h-dvh overflow-hidden select-none flex flex-col justify-center items-center relative transition-colors duration-400"
      style={{
        backgroundColor: "var(--bg-primary, #ffffff)",
      }}
    >
      {/* Background Particles sieu nhe mượt mà */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <Particles
          particleColors={isDark ? ["#ffffff", "#dcf4ff", "#a5d8ff"] : ["#334155", "#475569", "#64748b"]}
          particleCount={180}
          speed={0.12}
          particleBaseSize={80}
          glow={isDark ? 0.75 : 0}
          twinkle={0.35}
          depthOfField={0.2}
          lightMode={!isDark}
          className="w-full h-full"
        />
      </div>

      {/* OGL FlexCarousel - bang anh ha xuong 1 xiu bang translateY */}
      <div
        className="relative z-10 w-full h-full"
        style={{ transform: "translateY(5%)" }}
      >
        <FlexCarousel
          ref={carouselRef}
          items={carouselItems}
          preset="arch"
          dispersion={2.5}
          bend={0.65}
          reach={0.55}
          lensHeight={1.45}
          lensWidth={0.95}
          intro="rise"
          cardHeight={0.48}
          gap={14}
          radius={16}
          fit="portrait"
          onSelect={(index, item, cardRect) => {
            if (item?.category) {
              const rawCover = item.category.cover || item.category.items?.[0]?.image || "";
              
              // Kiểm tra tỉ lệ ảnh thực tế của tấm ảnh (ảnh ngang vs ảnh dọc)
              const img = new Image();
              img.src = rawCover || item.src;
              const handleWithOrientation = (isLandscape) => {
                const heroInfo = {
                  src: item.src,
                  rawCover,
                  fromRect: cardRect || null,
                  isLandscape, // true: ảnh ngang, false: ảnh dọc
                };
                onCategorySelect?.(item.category, heroInfo);
              };

              if (img.complete && img.naturalWidth > 0) {
                handleWithOrientation(img.naturalWidth >= img.naturalHeight);
              } else {
                img.onload = () => {
                  handleWithOrientation(img.naturalWidth >= img.naturalHeight);
                };
                img.onerror = () => {
                  // Mặc định fallback là ảnh dọc nếu không load được
                  handleWithOrientation(false);
                };
              }
            }
          }}
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
