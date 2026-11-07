import { useMemo, useRef, useState, useEffect } from "react";
import { Particles } from "./ui/Particles";
import { buildSrc } from "../utils/cloudinary";

export default function MobileWorksWheelHome({
  categories = [],
  allItems = [],
  onCategorySelect,
  theme = "light",
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);

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

  // Lang nghe vi tri cuon de cap nhat activeIndex va so trang
  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const cardWidth = el.offsetWidth * 0.7 + 16;
    const idx = Math.round(scrollLeft / cardWidth);
    if (idx >= 0 && idx < carouselItems.length && idx !== activeIndex) {
      setActiveIndex(idx);
    }
  };

  const currentItem = carouselItems[activeIndex] || carouselItems[0];

  return (
    <div
      className="w-full h-dvh overflow-hidden select-none flex flex-col justify-center items-center relative transition-colors duration-400"
      style={{
        backgroundColor: "var(--bg-primary, #ffffff)",
      }}
    >
      {/* Background Particles: Chay muot ma 100%, dong bo mau theo theme */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <Particles
          particleColors={isDark ? ["#ffffff", "#dcf4ff", "#a5d8ff"] : ["#334155", "#475569", "#64748b"]}
          particleCount={180}
          speed={0.12}
          particleBaseSize={70}
          glow={isDark ? 0.7 : 0}
          twinkle={0.35}
          depthOfField={0.2}
          lightMode={!isDark}
          className="w-full h-full"
        />
      </div>

      {/* Tieu de can giua ngay tren dau anh, dong bo theo theme */}
      <div className="relative z-10 w-full text-center px-4 mb-4">
        <h2
          className="text-[17px] font-medium tracking-tight transition-colors duration-300"
          style={{
            color: "var(--text-primary, #111111)",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {currentItem?.title || "Portfolio"}
        </h2>
      </div>

      {/* Hang anh scroll snap 3D vuot ngang */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="relative z-10 w-full flex items-center overflow-x-auto no-scrollbar py-2 snap-x snap-mandatory px-[15vw] gap-4"
        style={{ scrollBehavior: "smooth" }}
      >
        {carouselItems.map((item, idx) => (
          <div
            key={idx}
            onClick={() => onCategorySelect?.(item.category)}
            className="flex-shrink-0 snap-center flex flex-col items-center cursor-pointer transition-all duration-300 active:scale-95"
            style={{
              width: "70vw",
              maxWidth: "320px",
              opacity: idx === activeIndex ? 1 : 0.45,
              transform: idx === activeIndex ? "scale(1)" : "scale(0.92)",
            }}
          >
            <div
              className="w-full rounded-2xl overflow-hidden shadow-2xl transition-all duration-300"
              style={{
                aspectRatio: "3 / 4",
                boxShadow: isDark
                  ? "0 20px 40px -15px rgba(0,0,0,0.8), 0 0 20px rgba(255,255,255,0.06)"
                  : "0 20px 40px -15px rgba(0,0,0,0.18)",
                border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.08)",
              }}
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

      {/* So trang / counter ngay duoi anh */}
      <div className="relative z-10 mt-5">
        <p
          className="text-[13px] font-medium tabular-nums tracking-wider opacity-70"
          style={{
            color: "var(--text-primary, #111111)",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {String(activeIndex + 1).padStart(2, "0")} / {String(carouselItems.length).padStart(2, "0")}
        </p>
      </div>
    </div>
  );
}
