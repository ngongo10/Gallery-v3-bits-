import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import OptionWheel from "../components/OptionWheel";
import DriftWall from "../components/DriftWall";
import ThreeDHoverGallery from "../components/ThreeDHoverGallery";
import MobileDraggableHome from "../components/MobileDraggableHome";
import HomeMosaic from "../components/HomeMosaic";
import ModeLoadingOverlay from "../components/ModeLoadingOverlay";
import { categories, allItems } from "../data/portfolio";
import "./HomePage.css";

function isMobileDevice() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(max-width: 768px)").matches ||
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  );
}

// Separate art vs memories
const artCategories = categories.filter((c) => c.mode === "art");
const memoriesCategories = categories.filter((c) => c.mode === "memories");
const memoriesItems = allItems.filter((i) => i.mode === "memories");

const HomePage = ({
  theme = 'light',
  onCategorySelect,
  isExiting = false,
  mode = 'art',
  pendingMode = null,
  transitioning = false,
  onTransitionDone
}) => {
  const [selectedCategory, setSelectedCategory] = useState(artCategories[0]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isChanging, setIsChanging] = useState(false);
  const changeTimerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(() => isMobileDevice());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(isMobileDevice());
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const artCategoryLabels = artCategories.map((c) => c.label);

  const handleWheelChange = (index) => {
    setIsChanging(true);
    clearTimeout(changeTimerRef.current);
    changeTimerRef.current = setTimeout(() => {
      setSelectedCategory(artCategories[index]);
      setSelectedIndex(index);
      setIsChanging(false);
    }, 240);
  };

  useEffect(() => {
    const reveal = setTimeout(() => setIsLoaded(true), 50);
    return () => {
      clearTimeout(reveal);
      clearTimeout(changeTimerRef.current);
    };
  }, []);

  // ── Art mode category select ──────────────────────────────────────────
  const handleCategorySelect = useCallback((itemOrCat) => {
    let target = selectedCategory;
    if (itemOrCat) {
      if (itemOrCat.category) {
        const found = artCategories.find((c) => c.id === itemOrCat.category);
        if (found) target = found;
      } else if (itemOrCat.id) {
        target = itemOrCat;
      }
    }
    if (onCategorySelect) onCategorySelect(target);
  }, [selectedCategory, onCategorySelect]);

  // ── Memories mode item click → find category and open gallery ──────────
  const handleMemoriesItemClick = (item) => {
    // item has: id, image, title, category (cat id), categoryLabel, mode
    const cat = memoriesCategories.find((c) => c.id === item.category);
    if (cat && onCategorySelect) {
      onCategorySelect(cat);
    }
  };

  // ── DriftWall items & columns ──────────────────────────────────────────
  // On mobile: each column corresponds to an ART album with vertical album label
  const mobileColumnGroups = useMemo(() => {
    return artCategories.map(cat => ({
      id: cat.id,
      label: cat.label,
      items: (cat.items && cat.items.length > 0)
        ? cat.items
        : allItems.filter(i => i.category === cat.id)
    }));
  }, []);

  const driftItems = useMemo(() => {
    const categoryItems = allItems.filter((i) => i.category === selectedCategory?.id);
    const baseItems =
      categoryItems.length >= 4 ? categoryItems : categoryItems.concat(allItems.slice(0, 8));
    return isMobile ? baseItems.slice(0, 4) : baseItems;
  }, [selectedCategory?.id, isMobile]);

  // ── 3D Hover Gallery items for Mobile (ART albums) ───────────────────
  const mobileHoverGalleryItems = useMemo(() => {
    const GLOWS = [
      "rgba(236,72,153,0.4)",
      "rgba(6,182,212,0.4)",
      "rgba(139,92,246,0.4)",
      "rgba(245,158,11,0.4)",
      "rgba(16,185,129,0.4)"
    ];
    return artCategories.map((cat, idx) => ({
      url: cat.cover || cat.items?.[0]?.image || "",
      title: cat.label,
      category: "ART",
      description: `${cat.items?.length || 0} Photos`,
      glow: GLOWS[idx % GLOWS.length],
      categoryObj: cat
    }));
  }, []);

  const effectiveMode = transitioning ? mode : mode; // current visible mode

  return (
    <div className={`home-page${isMobile ? " home-page--mobile" : ""} home-page--${effectiveMode}`}>

      {/* ── ART / WORK mode ── */}
      {effectiveMode === "art" && (
        <>
          {/* MOBILE: Draggable Card Home */}
          {isMobile ? (
            <div className={`home-mobile-draggable-wrap${isLoaded ? " is-revealed" : ""}`}>
              <MobileDraggableHome
                categories={artCategories}
                onCategorySelect={handleCategorySelect}
              />
            </div>
          ) : (
            /* DESKTOP: DriftWall + OptionWheel unchanged */
            <>
              <div className={`home-driftwall${isLoaded ? " is-revealed" : ""}${isChanging ? " is-changing" : ""}`}>
                <DriftWall
                  key={selectedCategory?.id}
                  items={driftItems}
                  columns={2}
                  tileWidth={144}
                  tileHeight={172}
                  gap={18}
                  tilt={30}
                  turn={-30}
                  perspective={900}
                  depth={400}
                  speed={isChanging ? 120 : 58}
                  direction="up"
                  variance={0.35}
                  parallax={2}
                  lift={108}
                  fade={0.12}
                  dim={1}
                  overlayColor="transparent"
                  radius={8}
                  roll={5}
                  onTileClick={handleCategorySelect}
                />
              </div>

              <div className="home-wheel">
                <OptionWheel
                  items={artCategoryLabels}
                  defaultSelected={0}
                  textColor={theme === 'dark' ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 0, 0, 0.35)'}
                  activeColor={theme === 'dark' ? '#ffffff' : '#0a0a0c'}
                  side="left"
                  fontSize={2.8}
                  spacing={1.5}
                  curve={1}
                  tilt={7}
                  blur={2.5}
                  fade={0.3}
                  minOpacity={0.04}
                  smoothing={180}
                  inset={64}
                  loop={false}
                  draggable={!isExiting}
                  exiting={isExiting}
                  onChange={handleWheelChange}
                  onItemClick={(idx) => handleCategorySelect(artCategories[idx])}
                />
              </div>

              <div className="home-footer">
                <span className="home-footer-text">Scroll or drag to explore</span>
                <span className="home-footer-dot" />
                <span className="home-footer-text">Click to open</span>
              </div>
            </>
          )}
        </>
      )}

      {/* ── MEMORIES mode ── */}
      {effectiveMode === "memories" && (
        <HomeMosaic
          items={memoriesItems}
          onItemClick={handleMemoriesItemClick}
        />
      )}

      {/* ── Transition overlay ── */}
      <ModeLoadingOverlay
        active={transitioning}
        targetMode={pendingMode ?? mode}
        onDone={onTransitionDone}
      />
    </div>
  );
};

export default HomePage;
