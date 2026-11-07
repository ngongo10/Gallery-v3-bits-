import { useMemo } from "react";
import { FlexCarousel } from "./FlexCarousel";
import { Particles } from "./ui/Particles";
import { buildSrc } from "../utils/cloudinary";

// Ảnh nền trang home — Chân Dung #8
const HOME_BG_SRC = "https://res.cloudinary.com/g55oyjhn/image/upload/f_auto,q_auto,w_900/Still_2026-09-05_010136_1.4.1";

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
      {/* ── Ảnh nền Chân Dung #8 ── */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        style={{ overflow: "hidden" }}
      >
        <img
          src={HOME_BG_SRC}
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center top",
            opacity: isDark ? 0.18 : 0.12,
            filter: isDark
              ? "blur(28px) brightness(0.6) saturate(0.7)"
              : "blur(22px) brightness(1.0) saturate(0.75)",
            transform: "scale(1.08)",
            transition: "opacity 0.6s ease, filter 0.6s ease",
          }}
        />
        {/* Gradient overlay để blend đẹp hơn */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: isDark
              ? "linear-gradient(to bottom, rgba(5,5,7,0.55) 0%, rgba(5,5,7,0.2) 50%, rgba(5,5,7,0.65) 100%)"
              : "linear-gradient(to bottom, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.65) 100%)",
          }}
        />
      </div>

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
              const heroInfo = {
                src: item.src,
                fromRect: cardRect || null,
              };
              onCategorySelect?.(item.category, heroInfo);
            }
          }}
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
