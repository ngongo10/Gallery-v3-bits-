import { useMemo, useRef, useState, useEffect } from "react";
import { Particles } from "./ui/Particles";
import { buildSrc } from "../utils/cloudinary";

export default function MobileWorksWheelHome({
  categories = [],
  allItems = [],
  onCategorySelect,
  theme = "light",
}) {
  const [scrollX, setScrollX] = useState(0);
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

  // Tinh toan vi tri cuon
  const handleScroll = (e) => {
    setScrollX(e.currentTarget.scrollLeft);
  };

  // Tinh toan item trung tam hien tai
  const containerWidth = typeof window !== "undefined" ? window.innerWidth : 400;
  const cardWidth = containerWidth * 0.72;
  const gap = 20;
  const step = cardWidth + gap;
  const activeIndex = Math.max(0, Math.min(carouselItems.length - 1, Math.round(scrollX / step)));
  const currentItem = carouselItems[activeIndex] || carouselItems[0];

  return (
    <div
      className="w-full h-dvh overflow-hidden select-none flex flex-col justify-center items-center relative transition-colors duration-400"
      style={{
        backgroundColor: "var(--bg-primary, #ffffff)",
      }}
    >
      {/* Background Particles sieu dep */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <Particles
          particleColors={isDark ? ["#ffffff", "#dcf4ff", "#a5d8ff"] : ["#334155", "#475569", "#64748b"]}
          particleCount={200}
          speed={0.12}
          particleBaseSize={80}
          glow={isDark ? 0.75 : 0}
          twinkle={0.35}
          depthOfField={0.2}
          lightMode={!isDark}
          className="w-full h-full"
        />
      </div>

      {/* Tieu de can giua ngay tren dau anh */}
      <div className="relative z-10 w-full text-center px-4 mb-5">
        <h2
          className="text-[17px] font-medium tracking-tight transition-all duration-300"
          style={{
            color: "var(--text-primary, #111111)",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {currentItem?.title || "Portfolio"}
        </h2>
      </div>

      {/* Hang anh 3D Coverflow Perspective Wheel */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="relative z-10 w-full flex items-center overflow-x-auto no-scrollbar snap-x snap-mandatory py-8"
        style={{
          paddingLeft: "calc(50vw - 36vw)",
          paddingRight: "calc(50vw - 36vw)",
          gap: `${gap}px`,
          perspective: "1200px",
          scrollBehavior: "smooth",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {carouselItems.map((item, idx) => {
          // Tinh khoang cach tu giua card den giua man hinh
          const cardCenter = idx * step;
          const dist = (scrollX - cardCenter) / step; // -1, 0, 1
          const clampedDist = Math.max(-1.5, Math.min(1.5, dist));

          // Hieu ung 3D: xoay truc Y theo do cuon, zoom phong to o giua, chieu sau Z
          const rotateY = clampedDist * -24; // Uon cong hinh vong cung 3D
          const scale = 1 - Math.min(0.22, Math.abs(clampedDist) * 0.18);
          const translateZ = -Math.abs(clampedDist) * 60;
          const opacity = 1 - Math.min(0.65, Math.abs(clampedDist) * 0.55);

          return (
            <div
              key={idx}
              onClick={() => onCategorySelect?.(item.category)}
              className="flex-shrink-0 snap-center flex flex-col items-center cursor-pointer will-change-transform"
              style={{
                width: `${cardWidth}px`,
                maxWidth: "320px",
                transform: `perspective(1000px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                opacity: opacity,
                transition: "transform 0.15s ease-out, opacity 0.15s ease-out",
                transformStyle: "preserve-3d",
              }}
            >
              <div
                className="w-full rounded-2xl overflow-hidden shadow-2xl relative"
                style={{
                  aspectRatio: "3 / 4",
                  boxShadow: isDark
                    ? "0 25px 50px -12px rgba(0,0,0,0.85), 0 0 25px rgba(255,255,255,0.06)"
                    : "0 20px 45px -15px rgba(0,0,0,0.22)",
                  border: isDark ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(0,0,0,0.08)",
                }}
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  className="w-full h-full object-cover pointer-events-none select-none"
                  loading="lazy"
                />
                {/* Lop vien kinh phan chieu subtle */}
                <div
                  className="absolute inset-0 pointer-events-none rounded-2xl"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* So trang / counter ngay duoi anh */}
      <div className="relative z-10 mt-5">
        <p
          className="text-[13px] font-medium tabular-nums tracking-wider opacity-75"
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
