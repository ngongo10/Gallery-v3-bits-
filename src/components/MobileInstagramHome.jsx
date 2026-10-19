import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  MoreHorizontal,
  Grid3X3,
  Film,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
  Layers,
} from "lucide-react";
import ImageLightbox from "./ImageLightbox";
import { buildSrc } from "../utils/cloudinary";

export default function MobileInstagramHome({
  categories = [],
  allItems = [],
  onCategorySelect,
  theme = "light",
}) {
  const [activeTab, setActiveTab] = useState("posts"); // 'posts' (feed) | 'grid'
  const [activeStoryAlbum, setActiveStoryAlbum] = useState(null);
  const [likedPosts, setLikedPosts] = useState({});
  const [savedPosts, setSavedPosts] = useState({});
  const [activeLightbox, setActiveLightbox] = useState(null);

  // Nhóm các album ART
  const artAlbums = useMemo(() => {
    const artCats = categories.filter((c) => c.mode === "art");
    const source = artCats.length > 0 ? artCats : categories;

    return source.map((cat, catIdx) => {
      const items = (cat.items && cat.items.length > 0)
        ? cat.items.filter((i) => i.image)
        : allItems.filter((i) => i.category === cat.id && i.image);

      return {
        id: cat.id,
        label: cat.label,
        cover: cat.cover || items[0]?.image || "",
        items,
        likesCount: 120 + catIdx * 45 + items.length * 3,
        date: `${catIdx + 1} NGÀY TRƯỚC`,
        categoryObj: cat,
      };
    });
  }, [categories, allItems]);

  // Tổng số ảnh
  const totalPhotosCount = useMemo(() => {
    return artAlbums.reduce((sum, a) => sum + a.items.length, 0);
  }, [artAlbums]);

  // Phẳng toàn bộ ảnh cho tab Grid
  const allGridPhotos = useMemo(() => {
    const list = [];
    artAlbums.forEach((album) => {
      album.items.forEach((item, itemIdx) => {
        list.push({
          ...item,
          albumId: album.id,
          albumLabel: album.label,
          categoryObj: album.categoryObj,
          originalIndex: itemIdx,
          albumItems: album.items,
        });
      });
    });
    return list;
  }, [artAlbums]);

  const toggleLike = (albumId) => {
    setLikedPosts((prev) => ({
      ...prev,
      [albumId]: !prev[albumId],
    }));
  };

  const toggleSave = (albumId) => {
    setSavedPosts((prev) => ({
      ...prev,
      [albumId]: !prev[albumId],
    }));
  };

  const openLightboxForAlbum = (album, itemIndex = 0) => {
    setActiveLightbox({
      items: album.items,
      index: itemIndex,
      category: album.categoryObj,
    });
  };

  return (
    <div
      className={`w-full min-h-screen pb-20 pt-14 selection:bg-neutral-800 selection:text-white ${
        theme === "dark"
          ? "bg-[#000000] text-neutral-100"
          : "bg-[#ffffff] text-neutral-900"
      }`}
      style={{ overflowY: "auto", WebkitOverflowScrolling: "touch" }}
    >
      {/* ── PROFILE HEADER (INSTAGRAM STYLE) ── */}
      <header className="px-4 pt-2 pb-4 border-b border-neutral-200/50 dark:border-neutral-800/80">
        <div className="flex items-center gap-4">
          {/* Avatar with Story Gradient Border */}
          <div className="relative p-[2.5px] rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex-shrink-0">
            <div className="w-18 h-18 rounded-full p-[2px] bg-white dark:bg-black overflow-hidden">
              <img
                src={
                  artAlbums[0]?.cover
                    ? buildSrc(artAlbums[0].cover, { w: 180, dprAuto: true })
                    : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=180&q=80"
                }
                alt="Jubi Sataka Avatar"
                className="w-full h-full object-cover rounded-full select-none"
              />
            </div>
            <span className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 border-2 border-white dark:border-black rounded-full flex items-center justify-center text-[9px] text-white">
              ✓
            </span>
          </div>

          {/* Stats Bar */}
          <div className="flex-1 flex justify-around items-center text-center">
            <div className="flex flex-col">
              <span className="font-bold text-base leading-tight">
                {artAlbums.length}
              </span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Albums
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base leading-tight">
                {totalPhotosCount}
              </span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Tác phẩm
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base leading-tight">1.2k</span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Người xem
              </span>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="mt-3 px-1">
          <div className="flex items-center gap-1.5">
            <h1 className="font-bold text-sm leading-tight">Jubi Sataka</h1>
            <span className="text-xs text-neutral-400 font-normal">
              • Nhiếp ảnh nghệ thuật
            </span>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1 leading-snug">
            Visual Artist & Photographer 📸
            <br />
            Bộ sưu tập chân dung, kỷ yếu & sự kiện cosplay độc quyền.
          </p>
        </div>

        {/* Quick Actions (Follow / Message / Share) */}
        <div className="flex items-center gap-2 mt-3 px-1">
          <button
            type="button"
            onClick={() => onCategorySelect?.(artAlbums[0]?.categoryObj)}
            className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-neutral-900 text-white dark:bg-white dark:text-black active:scale-[0.98] transition-transform flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>Khám phá Gallery</span>
            <ArrowUpRight size={13} />
          </button>
          <a
            href="mailto:contact@jubisataka.com"
            className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-neutral-100 text-neutral-800 dark:bg-neutral-800/80 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700/60 active:scale-[0.98] transition-transform flex items-center justify-center"
          >
            Liên hệ chụp
          </a>
        </div>
      </header>

      {/* ── STORIES / ALBUM HIGHLIGHTS ── */}
      <section
        className="py-3 px-3 flex gap-4 overflow-x-auto no-scrollbar border-b border-neutral-200/50 dark:border-neutral-800/80 items-center"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {artAlbums.map((album) => {
          const coverImg = album.cover || album.items[0]?.image;
          return (
            <button
              key={album.id}
              type="button"
              onClick={() => openLightboxForAlbum(album, 0)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 group active:scale-95 transition-transform"
            >
              <div className="p-[2px] rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-fuchsia-600">
                <div className="w-15 h-15 rounded-full p-[2px] bg-white dark:bg-black overflow-hidden">
                  <img
                    src={buildSrc(coverImg, { w: 120, dprAuto: true })}
                    alt={album.label}
                    className="w-full h-full object-cover rounded-full select-none"
                  />
                </div>
              </div>
              <span className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300 truncate max-w-[68px] text-center">
                {album.label}
              </span>
            </button>
          );
        })}
      </section>

      {/* ── TABS: FEED (CAROUSEL) vs GRID (LƯỚI ẢNH) ── */}
      <div className="flex border-b border-neutral-200/60 dark:border-neutral-800 sticky top-14 z-10 bg-white/95 dark:bg-black/95 backdrop-blur-md">
        <button
          type="button"
          onClick={() => setActiveTab("posts")}
          className={`flex-1 py-2.5 flex items-center justify-center gap-2 border-b-2 text-xs font-semibold transition-colors ${
            activeTab === "posts"
              ? "border-neutral-900 dark:border-white text-neutral-900 dark:text-white"
              : "border-transparent text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
          }`}
        >
          <Layers size={17} />
          <span>Albums ({artAlbums.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("grid")}
          className={`flex-1 py-2.5 flex items-center justify-center gap-2 border-b-2 text-xs font-semibold transition-colors ${
            activeTab === "grid"
              ? "border-neutral-900 dark:border-white text-neutral-900 dark:text-white"
              : "border-transparent text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
          }`}
        >
          <Grid3X3 size={17} />
          <span>Lưới ảnh ({allGridPhotos.length})</span>
        </button>
      </div>

      {/* ── TAB CONTENT ── */}
      {activeTab === "posts" ? (
        /* INSTAGRAM FEED VIEW: Mỗi Album là 1 bài Post Carousel nhiều ảnh */
        <div className="flex flex-col divide-y divide-neutral-200/70 dark:divide-neutral-800/80">
          {artAlbums.map((album) => (
            <InstagramPostItem
              key={album.id}
              album={album}
              isLiked={Boolean(likedPosts[album.id])}
              isSaved={Boolean(savedPosts[album.id])}
              onToggleLike={() => toggleLike(album.id)}
              onToggleSave={() => toggleSave(album.id)}
              onOpenPhoto={(idx) => openLightboxForAlbum(album, idx)}
              onGoToGallery={() => onCategorySelect?.(album.categoryObj)}
            />
          ))}
        </div>
      ) : (
        /* INSTAGRAM 3-COLUMN GRID VIEW */
        <div className="grid grid-cols-3 gap-[2px] bg-neutral-200/40 dark:bg-neutral-800/40">
          {allGridPhotos.map((photo, pIdx) => {
            const photoSrc = photo.image || photo.src;
            return (
              <div
                key={`${photo.id || pIdx}-${pIdx}`}
                onClick={() => {
                  setActiveLightbox({
                    items: photo.albumItems,
                    index: photo.originalIndex,
                    category: photo.categoryObj,
                  });
                }}
                className="relative aspect-square bg-neutral-100 dark:bg-neutral-900 overflow-hidden cursor-pointer active:opacity-85 group"
              >
                <img
                  src={buildSrc(photoSrc, { w: 320, dprAuto: true })}
                  alt={photo.caption || "Photo"}
                  loading="lazy"
                  className="w-full h-full object-cover select-none pointer-events-none"
                  draggable={false}
                />
                {/* Carousel icon indicator if album has multiple images */}
                {photo.albumItems.length > 1 && (
                  <span className="absolute top-1.5 right-1.5 p-1 bg-black/40 backdrop-blur-sm rounded-md text-white text-[10px]">
                    <Layers size={12} />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox xem ảnh lớn với nút điều hướng gallery */}
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

// ── BÀI POST DẠNG INSTAGRAM CAROUSEL ──
const InstagramPostItem = ({
  album,
  isLiked,
  isSaved,
  onToggleLike,
  onToggleSave,
  onOpenPhoto,
  onGoToGallery,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollRef = useRef(null);
  const items = album.items || [];
  const total = items.length;

  const handleScroll = (e) => {
    const el = e.currentTarget;
    const scrollLeft = el.scrollLeft;
    const width = el.clientWidth;
    const newIndex = Math.round(scrollLeft / width);
    if (newIndex !== currentSlide && newIndex >= 0 && newIndex < total) {
      setCurrentSlide(newIndex);
    }
  };

  return (
    <article className="pt-3 pb-4">
      {/* Post Header: User info + Album Name */}
      <div className="flex items-center justify-between px-3.5 mb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full p-[1.5px] bg-gradient-to-tr from-amber-500 to-rose-500 overflow-hidden flex-shrink-0">
            <img
              src={buildSrc(album.cover, { w: 80, dprAuto: true })}
              alt={album.label}
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-xs leading-none">
                jubi_sataka
              </span>
              <span className="text-[10px] text-neutral-400">•</span>
              <span className="text-[10px] text-neutral-400 font-mono">
                {album.label}
              </span>
            </div>
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">
              Bộ sưu tập #{album.label}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onGoToGallery}
          className="text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1 p-1"
        >
          <span>Xem album</span>
          <ArrowUpRight size={13} />
        </button>
      </div>

      {/* Post Media: Swipeable Carousel */}
      <div className="relative aspect-[4/5] sm:aspect-square bg-neutral-950 overflow-hidden">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="w-full h-full flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {items.map((item, idx) => {
            const imgSrc = item.image || item.src;
            return (
              <div
                key={item.id || idx}
                onClick={() => onOpenPhoto(idx)}
                className="w-full h-full flex-shrink-0 snap-center relative cursor-pointer"
              >
                <img
                  src={buildSrc(imgSrc, { w: 720, dprAuto: true })}
                  alt={item.caption || `${album.label} photo ${idx + 1}`}
                  loading={idx === 0 ? "eager" : "lazy"}
                  className="w-full h-full object-cover select-none pointer-events-none"
                  draggable={false}
                />
              </div>
            );
          })}
        </div>

        {/* Counter Badge (e.g. 1/9) in Top Right */}
        {total > 1 && (
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-mono tracking-wider pointer-events-none">
            {currentSlide + 1}/{total}
          </div>
        )}
      </div>

      {/* Post Action Bar (Heart, Comment, Share, Bookmark + Carousel Dots) */}
      <div className="px-3.5 pt-2.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onToggleLike}
            className={`transition-transform active:scale-125 ${
              isLiked ? "text-rose-500 fill-rose-500" : "text-neutral-800 dark:text-neutral-200"
            }`}
            aria-label="Thích"
          >
            <Heart size={22} className={isLiked ? "fill-rose-500" : ""} />
          </button>

          <button
            type="button"
            onClick={() => onOpenPhoto(currentSlide)}
            className="text-neutral-800 dark:text-neutral-200 active:scale-110 transition-transform"
            aria-label="Bình luận"
          >
            <MessageCircle size={22} />
          </button>

          <button
            type="button"
            onClick={onGoToGallery}
            className="text-neutral-800 dark:text-neutral-200 active:scale-110 transition-transform"
            aria-label="Mở gallery"
          >
            <Share2 size={21} />
          </button>
        </div>

        {/* Carousel Pagination Dots */}
        {total > 1 && (
          <div className="flex items-center gap-1.5">
            {items.slice(0, 7).map((_, dotIdx) => (
              <span
                key={dotIdx}
                className={`rounded-full transition-all duration-300 ${
                  dotIdx === Math.min(currentSlide, 6)
                    ? "w-1.5 h-1.5 bg-blue-500"
                    : "w-1 h-1 bg-neutral-300 dark:bg-neutral-600"
                }`}
              />
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={onToggleSave}
          className={`transition-transform active:scale-110 ${
            isSaved ? "text-amber-500 fill-amber-500" : "text-neutral-800 dark:text-neutral-200"
          }`}
          aria-label="Lưu bài viết"
        >
          <Bookmark size={22} className={isSaved ? "fill-amber-500" : ""} />
        </button>
      </div>

      {/* Likes Count */}
      <div className="px-3.5 mt-2">
        <span className="font-semibold text-xs">
          {(album.likesCount + (isLiked ? 1 : 0)).toLocaleString()} lượt thích
        </span>
      </div>

      {/* Caption & Story Description */}
      <div className="px-3.5 mt-1 text-xs leading-relaxed">
        <span className="font-semibold mr-1.5">jubi_sataka</span>
        <span className="text-neutral-700 dark:text-neutral-300">
          Bộ ảnh <span className="font-medium text-neutral-900 dark:text-white">#{album.label}</span>. 
          Gồm {total} góc máy ghi lại những khoảnh khắc cảm xúc chân thực nhất.
        </span>
      </div>

      {/* View All Photos Link */}
      {total > 1 && (
        <button
          type="button"
          onClick={onGoToGallery}
          className="px-3.5 mt-1.5 text-xs text-neutral-500 dark:text-neutral-400 block hover:underline"
        >
          Xem tất cả {total} tác phẩm trong album này →
        </button>
      )}

      {/* Timestamp */}
      <div className="px-3.5 mt-1">
        <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400">
          {album.date}
        </span>
      </div>
    </article>
  );
};
