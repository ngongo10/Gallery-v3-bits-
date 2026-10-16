import React, {
  useRef,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export const ImageCard = ({
  src,
  alt = "Gallery Asset",
  onLoad,
  onClick,
  className = "",
}) => {
  return (
    <div
      onClick={onClick}
      className={`w-full h-[220px] sm:h-[300px] md:h-[400px] flex-shrink-0 bg-[#111] rounded-lg overflow-hidden transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98] cursor-pointer relative will-change-transform backface-hidden preserve-3d shadow-xl border border-white/5 ${className}`}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={onLoad}
        className="w-full h-full object-cover opacity-85 hover:opacity-100 transition-opacity duration-300 select-none pointer-events-none"
        draggable={false}
      />
    </div>
  );
};

export default function ParallaxUnfurlingGallery({
  columns = [],
  onImageClick,
  className = "",
}) {
  const scrollWrapperRef = useRef(null);
  const containerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const loadedCountRef = useRef(0);

  const handleItemLoad = useCallback(() => {
    loadedCountRef.current += 1;
    if (!isReady && loadedCountRef.current >= 1) setIsReady(true);
  }, [isReady]);

  useEffect(() => {
    const t = setTimeout(() => setIsReady(true), 1200);
    return () => clearTimeout(t);
  }, []);

  // LINKED SCROLL: containerRef inside scrollWrapperRef
  const { scrollYProgress } = useScroll({
    target: containerRef,
    container: scrollWrapperRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 20,
    mass: 0.5,
  });

  // Banner expansion on initial scroll
  const bannerWidth = useTransform(smoothProgress, [0, 0.15], ["92vw", "100vw"]);
  const bannerHeight = useTransform(smoothProgress, [0, 0.15], ["82vh", "100vh"]);
  const bannerRadius = useTransform(smoothProgress, [0, 0.15], ["36px", "0px"]);
  const bannerBorderWidth = useTransform(smoothProgress, [0, 0.15], ["3px", "0px"]);

  // 3D Matrix unfurling animations (unfurl from 3D tilt into flat/straight grid)
  const rotateY = useTransform(smoothProgress, [0.15, 1], [-42, 0]);
  const rotateX = useTransform(smoothProgress, [0.15, 1], [24, 0]);
  const rotateZ = useTransform(smoothProgress, [0.15, 1], [14, 0]);
  const translateZ = useTransform(smoothProgress, [0.15, 1], [-650, 0]);

  // Dynamic parallax transforms for columns
  // Even columns scroll up, odd columns scroll down / stagger
  const columnParallaxes = useMemo(() => {
    return columns.map((_, idx) => {
      const isEven = idx % 2 === 0;
      const start = isEven ? "0%" : "-35%";
      const end = isEven ? "-35%" : "15%";
      return { start, end };
    });
  }, [columns]);

  return (
    <div
      ref={scrollWrapperRef}
      className={`w-full h-screen overflow-y-auto overflow-x-hidden bg-[#050505] selection:bg-white selection:text-black ${className}`}
    >
      <section
        ref={containerRef}
        className="relative w-full h-[500vh] bg-[#050505] text-white font-sans"
      >
        <div className="sticky top-0 h-screen w-full flex justify-center items-center overflow-hidden">
          <motion.div
            style={{
              width: bannerWidth,
              height: bannerHeight,
              borderRadius: bannerRadius,
              borderWidth: bannerBorderWidth,
              borderColor: "#2c2738",
            }}
            className="relative bg-black overflow-hidden flex items-center justify-center max-w-[1920px] mx-auto will-change-transform backface-hidden preserve-3d shadow-2xl"
          >
            <div
              className="absolute inset-0 flex justify-center items-center"
              style={{ perspective: "1000px" }}
            >
              {/* Ambient Shadow Box Masking */}
              <div className="absolute inset-0 z-20 pointer-events-none shadow-[inset_0_100px_150px_-50px_rgba(0,0,0,0.9),inset_0_-100px_150px_-50px_rgba(0,0,0,0.9)]" />
              <div className="absolute inset-0 z-20 pointer-events-none shadow-[inset_100px_0_120px_-50px_rgba(0,0,0,0.85),inset_-100px_0_120px_-50px_rgba(0,0,0,0.85)]" />

              {/* Parallax Image Grid Matrix */}
              <motion.div
                style={{
                  rotateX,
                  rotateY,
                  rotateZ,
                  z: translateZ,
                  transformStyle: "preserve-3d",
                }}
                className="flex gap-4 sm:gap-6 md:gap-8 justify-center items-center w-[140vw] h-[160vh] origin-center opacity-100 will-change-transform backface-hidden"
              >
                {columns.map((col, colIdx) => {
                  const pConfig = columnParallaxes[colIdx] || { start: "0%", end: "-30%" };
                  return (
                    <ColumnWithParallax
                      key={col.id || colIdx}
                      col={col}
                      colIdx={colIdx}
                      smoothProgress={smoothProgress}
                      start={pConfig.start}
                      end={pConfig.end}
                      onItemLoad={handleItemLoad}
                      onImageClick={onImageClick}
                    />
                  );
                })}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

const ColumnWithParallax = ({
  col,
  colIdx,
  smoothProgress,
  start,
  end,
  onItemLoad,
  onImageClick,
}) => {
  const y = useTransform(smoothProgress, [0.15, 1], [start, end]);

  return (
    <motion.div
      style={{ y }}
      className="flex flex-col gap-4 sm:gap-6 w-[36vw] sm:w-[26vw] md:w-[20vw] min-w-[170px] max-w-[320px] pointer-events-auto"
    >
      {/* Optional column header */}
      {col.label && (
        <div className="text-center py-2 text-xs uppercase tracking-widest text-white/50 border-b border-white/10 font-mono">
          {col.label}
        </div>
      )}

      {col.items.map((item, itemIdx) => (
        <ImageCard
          key={item.id || `${colIdx}-${itemIdx}`}
          src={item.src || item.image}
          alt={item.caption || item.alt || `${col.label || "Album"} photo`}
          onLoad={onItemLoad}
          onClick={() => onImageClick?.(item, col, itemIdx)}
        />
      ))}
    </motion.div>
  );
};
