import { useMemo } from "react";
import { Particles } from "./ui/Particles";
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
        category: cat,
      };
    });
  }, [categories, allItems]);

  const isDark = theme === "dark";

  return (
    <div
      className="w-full h-dvh overflow-hidden select-none flex flex-col justify-center items-center relative"
      style={{ background: isDark ? "#060713" : "#ffffff" }}
    >
      {/* Background Particles moi ban vua them tu React Bits */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <Particles
          particleColors={isDark ? ["#ffffff", "#eefffb", "#ffffff"] : ["#1a202c", "#2d3748", "#4a5568"]}
          particleCount={290}
          particleSpread={9}
          speed={0.1}
          particleBaseSize={90}
          glow={0.65}
          twinkle={0.3}
          moveParticlesOnHover={false}
          hoverEffect="parallax"
          depthOfField={0.15}
          clickBurst={false}
          lightMode={!isDark}
          className="w-full h-full"
        />
      </div>

      {/* Hang anh scroll muot ma, trong suot 100%, khong can lop kinh liquid glass */}
      <div className="relative z-10 w-full flex items-center overflow-x-auto no-scrollbar py-6 snap-x snap-mandatory px-[15vw] gap-4">
        {carouselItems.map((item, idx) => (
          <div
            key={idx}
            onClick={() => onCategorySelect?.(item.category)}
            className="flex-shrink-0 snap-center flex flex-col items-center cursor-pointer transition-transform duration-300 active:scale-95"
            style={{ width: "70vw", maxWidth: "320px" }}
          >
            <p
              className="mb-3 text-[15px] font-medium tracking-tight text-center truncate w-full"
              style={{ color: "var(--text-primary, #ffffff)", fontFamily: "'Inter', sans-serif" }}
            >
              {item.title}
            </p>
            <div
              className="w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10"
              style={{ aspectRatio: "3 / 4" }}
            >
              <img
                src={item.src}
                alt={item.alt}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
