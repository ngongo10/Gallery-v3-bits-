import { useMemo, useState, useRef, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  animate,
} from "framer-motion";
import ImageLightbox from "./ImageLightbox";
import { ArrowUpRight, ChevronLeft, ChevronRight, Compass } from "lucide-react";
import { buildSrc } from "../utils/cloudinary";

export default function MobileParallaxUnfurlingHome({
  categories = [],
  allItems = [],
  onCategorySelect,
}) {
  const [activeLightbox, setActiveLightbox] = useState(null);
  const [activeColIndex, setActiveColIndex] = useState(0);

  // Chỉ lấy album nghệ thuật (hoặc tất cả categories có ảnh)
  const albumColumns = useMemo(() => {
    const artCats = categories.filter((c) => c.mode === "art");
    const sourceCats = artCats.length > 0 ? artCats : categories;

    return sourceCats.map((cat) => {
      const items = (cat.items && cat.items.length > 0)
        ? cat.items
        : allItems.filter((i) => i.category === cat.id);

      // Nhân đôi hoặc lấy tối thiểu 8 ảnh để cột dài cuộn đã tay
      let colItems = items.filter((item) => item.image);
      if (colItems.length > 0 && colItems.length < 8) {
        colItems = [...colItems, ...colItems, ...colItems].slice(0, 10);
      }

      return {
        id: cat.id,
        label: cat.label,
        categoryObj: cat,
        items: colItems,
      };
    });
  }, [categories, allItems]);

  const totalCols = albumColumns.length;

  // ── Scroll container cho hiệu ứng Unfurling 3D lúc ban đầu ──
  const scrollWrapperRef = useRef(null);
  const containerRef = useRef(null);
  const [isUnfurled, setIsUnfurled] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    container: scrollWrapperRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 20,
    mass: 0.5,
  });

  // Theo dõi khi người dùng cuộn mở bung ra (unfurled)
  useEffect(() => {
    const unsubscribe = smoothProgress.on("change", (v) => {
      setIsUnfurled(v > 0.65);
    });
    return () => unsubscribe();
  }, [smoothProgress]);

  // Banner animations
  const bannerWidth = useTransform(smoothProgress, [0, 0.2], ["92vw", "100vw"]);
  const bannerHeight = useTransform(smoothProgress, [0, 0.2], ["80vh", "100vh"]);
  const bannerRadius = useTransform(smoothProgress, [0, 0.2], ["32px", "0px"]);

  // 3D Matrix animations (nghiêng 3D -> thẳng đứng khi cuộn)
  const rotateY = useTransform(smoothProgress, [0.15, 0.9], [-38, 0]);
  const rotateX = useTransform(smoothProgress, [0.15, 0.9], [22, 0]);
  const rotateZ = useTransform(smoothProgress, [0.15, 0.9], [12, 0]);
  const translateZ = useTransform(smoothProgress, [0.15, 0.9], [-500, 0]);

  // Parallax offsets cho các cột khi cuộn trang tổng
  const colParallaxes = useMemo(() => {
    return albumColumns.map((_, idx) => {
      const isEven = idx % 2 === 0;
      return {
        start: isEven ? "0%" : "-30%",
        end: isEven ? "-25%" : "15%",
      };
    });
  }, [albumColumns]);

  // ── VUỐT NGANG / CHUYỂN ALBUM RA GIỮA ──
  // Chiều rộng cột trên mobile là khoảng 72vw, margin-gap 16px
  const horizontalTrackRef = useRef(null);

  const scrollAlbumToCenter = (index) => {
    const track = horizontalTrackRef.current;
    if (!track) return;
    const targetChild = track.children[index];
    if (targetChild) {
      targetChild.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
      setActiveColIndex(index);
    }
  };

  const handleNextCol = () => {
    const next = Math.min(totalCols - 1, activeColIndex + 1);
    scrollAlbumToCenter(next);
  };

  const handlePrevCol = () => {
    const prev = Math.max(0, activeColIndex - 1);
    scrollAlbumToCenter(prev);
  };

  const handleImageClick = (item, col, itemIndex) => {
    setActiveLightbox({
      items: col.items,
      index: itemIndex,
      category: col.categoryObj,
    });
  };

  return (
    <div
      ref={scrollWrapperRef}
      className="w-full h-screen overflow-y-auto overflow-x-hidden bg-[#050505] selection:bg-white selection:text-black relative"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <section
        ref={containerRef}
        className="relative w-full h-[320vh] bg-[#050505] text-white font-sans"
      >
        <div className="sticky top-0 h-screen w-full flex justify-center items-center overflow-hidden">
          <motion.div
            style={{
              width: bannerWidth,
              height: bannerHeight,
              borderRadius: bannerRadius,
            }}
            className="relative bg-black overflow-hidden flex items-center justify-center w-full mx-auto will-change-transform backface-hidden preserve-3d"
          >
            <div
              className="absolute inset-0 flex justify-center items-center"
              style={{ perspective: "1000px" }}
            >
              {/* Bóng ambient viền 4 góc */}
              <div className="absolute inset-0 z-20 pointer-events-none shadow-[inset_0_80px_100px_-40px_rgba(0,0,0,0.9),inset_0_-80px_100px_-40px_rgba(0,0,0,0.9)]" />
              <div className="absolute inset-0 z-20 pointer-events-none shadow-[inset_80px_0_100px_-40px_rgba(0,0,0,0.85),inset_-80px_0_100px_-40px_rgba(0,0,0,0.85)]" />

              {/* 3D PARALLAX MATRIX HOẶC HORIZONTAL SCROLLER KHI ĐÃ UNFURL */}
              <motion.div
                style={{
                  rotateX: isUnfurled ? 0 : rotateX,
                  rotateY: isUnfurled ? 0 : rotateY,
                  rotateZ: isUnfurled ? 0 : rotateZ,
                  z: isUnfurled ? 0 : translateZ,
                  transformStyle: "preserve-3d",
                }}
                className="w-full h-full flex items-center justify-center will-change-transform"
              >
                {/* Horizontal Snap Track cho phép vuốt trái/phải xem từng cột album */}
                <div
                  ref={horizontalTrackRef}
                  className="flex gap-4 px-6 md:gap-8 w-full h-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth items-center pointer-events-auto no-scrollbar"
                  style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    WebkitOverflowScrolling: "touch",
                  }}
                  onScroll={(e) => {
                    const el = e.currentTarget;
                    const center = el.scrollLeft + el.clientWidth / 2;
                    let closestIdx = 0;
                    let minDiff = Infinity;
                    Array.from(el.children).forEach((child, idx) => {
                      const childCenter = child.offsetLeft + child.clientWidth / 2;
                      const diff = Math.abs(center - childCenter);
                      if (diff < minDiff) {
                        minDiff = diff;
                        closestIdx = idx;
                      }
                    });
                    if (closestIdx !== activeColIndex) {
                      setActiveColIndex(closestIdx);
                    }
                  }}
                >
                  {albumColumns.map((col, colIdx) => {
                    const pConfig = colParallaxes[colIdx] || { start: "0%", end: "-20%" };
                    return (
                      <AlbumColumn
                        key={col.id}
                        col={col}
                        colIdx={colIdx}
                        isActive={colIdx === activeColIndex}
                        smoothProgress={smoothProgress}
                        isUnfurled={isUnfurled}
                        start={pConfig.start}
                        end={pConfig.end}
                        onImageClick={handleImageClick}
                        onCategorySelect={onCategorySelect}
                      />
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Album Selector Pills & Navigation Controls (nổi phía dưới) */}
      <div className="fixed bottom-6 left-0 right-0 z-30 flex flex-col items-center gap-2 pointer-events-none">
        {/* Nút vuốt trái / phải */}
        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full pointer-events-auto shadow-2xl">
          <button
            type="button"
            onClick={handlePrevCol}
            disabled={activeColIndex === 0}
            className="p-1 rounded-full text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            aria-label="Album trước"
          >
            <ChevronLeft size={18} />
          </button>

          <span className="text-xs font-mono font-medium tracking-wider text-white px-2">
            {activeColIndex + 1} / {totalCols}
          </span>

          <button
            type="button"
            onClick={handleNextCol}
            disabled={activeColIndex === totalCols - 1}
            className="p-1 rounded-full text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            aria-label="Album tiếp theo"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Dots chỉ báo album */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {albumColumns.map((col, idx) => (
            <button
              key={col.id}
              type="button"
              onClick={() => scrollAlbumToCenter(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === activeColIndex
                  ? "w-6 bg-white"
                  : "w-1.5 bg-white/30 hover:bg-white/60"
              }`}
              aria-label={`Chọn album ${col.label}`}
            />
          ))}
        </div>
      </div>

      {/* Lightbox phóng to ảnh khi bấm */}
      {activeLightbox && (
        <ImageLightbox
          items={activeLightbox.items}
          initialIndex={activeLightbox.index}
          onClose={() => setActiveLightbox(null)}
          actionButton={
            activeLightbox.category ? (
              <button
                type="button"
                className="mch-lightbox-gallery-btn"
                onClick={() => {
                  const cat = activeLightbox.category;
                  setActiveLightbox(null);
                  onCategorySelect?.(cat);
                }}
              >
                <span>Xem toàn bộ album {activeLightbox.category.label}</span>
                <ArrowUpRight size={15} aria-hidden="true" />
              </button>
            ) : null
          }
        />
      )}
    </div>
  );
}

// ── CỘT TỪNG ALBUM (CHO PHÉP VUỐT LÊN/XUỐNG ĐỘC LẬP TỪNG ALBUM) ──
const AlbumColumn = ({
  col,
  colIdx,
  isActive,
  smoothProgress,
  isUnfurled,
  start,
  end,
  onImageClick,
  onCategorySelect,
}) => {
  const parallaxY = useTransform(smoothProgress, [0.15, 0.9], [start, end]);
  const columnScrollRef = useRef(null);

  return (
    <motion.div
      style={{ y: isUnfurled ? 0 : parallaxY }}
      className={`snap-center flex-shrink-0 w-[72vw] sm:w-[50vw] md:w-[25vw] max-w-[340px] h-[78vh] flex flex-col rounded-2xl bg-white/[0.03] border transition-all duration-300 overflow-hidden backdrop-blur-sm ${
        isActive
          ? "border-white/30 shadow-[0_0_30px_rgba(255,255,255,0.08)] scale-[1.01]"
          : "border-white/10 opacity-70 scale-[0.96]"
      }`}
    >
      {/* Header album với nút xem nhanh */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/40 flex-shrink-0">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-mono tracking-widest text-white/40">
            Album #{colIdx + 1}
          </span>
          <h3 className="text-sm font-semibold text-white tracking-wide truncate max-w-[170px]">
            {col.label}
          </h3>
        </div>
        <button
          type="button"
          onClick={() => onCategorySelect?.(col.categoryObj)}
          className="text-white/60 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
          title={`Xem gallery ${col.label}`}
        >
          <ArrowUpRight size={16} />
        </button>
      </div>

      {/* Danh sách ảnh cuộn dọc độc lập cho từng album */}
      <div
        ref={columnScrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden p-3 flex flex-col gap-3.5 scroll-smooth no-scrollbar"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {col.items.map((item, itemIdx) => {
          const src = item.image || item.src;
          const optimizedSrc = src ? buildSrc(src, { w: 600, dprAuto: true }) : src;
          const alt = item.caption || item.alt || `${col.label} #${itemIdx + 1}`;

          return (
            <div
              key={item.id || `${colIdx}-${itemIdx}`}
              onClick={() => onImageClick?.(item, col, itemIdx)}
              className="w-full h-[220px] sm:h-[280px] flex-shrink-0 bg-[#161618] rounded-xl overflow-hidden cursor-pointer relative group transition-transform duration-200 active:scale-[0.98] border border-white/5 shadow-md"
            >
              <img
                src={optimizedSrc}
                alt={alt}
                loading={itemIdx < 4 ? "eager" : "lazy"}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none select-none"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                <span className="text-[11px] text-white/90 truncate font-medium">
                  {alt}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
