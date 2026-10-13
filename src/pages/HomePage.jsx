import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import OptionWheel from "../components/OptionWheel";
import DriftWall from "../components/DriftWall";
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
  // ART state
  const [selectedCategory, setSelectedCategory] = useState(artCategories[0]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isChanging, setIsChanging] = useState(false);
  const changeTimerRef = useRef(null);
  const isMobile = useMemo(() => isMobileDevice(), []);
  const [isLoaded, setIsLoaded] = useState(false);

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

  const effectiveMode = transitioning ? mode : mode; // current visible mode

  return (
    <div className={`home-page${isMobile ? " home-page--mobile" : ""} home-page--${effectiveMode}`}>

      {/* ── ART / WORK mode ── */}
      {effectiveMode === "art" && (
        <>
          <div className={`home-driftwall${isLoaded ? " is-revealed" : ""}${isChanging && !isMobile ? " is-changing" : ""}`}>
            <DriftWall
              key={isMobile ? "mobile-art-wall" : selectedCategory?.id}
              items={driftItems}
              columnGroups={isMobile ? mobileColumnGroups : null}
              showColumnLabels={isMobile}
              activeCol={isMobile ? selectedIndex : -1}
              columns={isMobile ? mobileColumnGroups.length : 2}
              tileWidth={isMobile ? 130 : 144}
              tileHeight={isMobile ? 180 : 172}
              gap={isMobile ? 20 : 18}
              tilt={isMobile ? 12 : 30}
              turn={isMobile ? 0 : -30}
              perspective={isMobile ? 1000 : 900}
              depth={isMobile ? 120 : 400}
              speed={isMobile ? 32 : isChanging ? 120 : 58}
              direction="up"
              variance={0.35}
              parallax={isMobile ? 0.2 : 2}
              lift={isMobile ? 40 : 108}
              fade={0}
              dim={1}
              overlayColor="transparent"
              radius={8}
              roll={isMobile ? 0 : 5}
              onTileClick={handleCategorySelect}
            />
          </div>

          <div className="home-wheel">
            <OptionWheel
              items={artCategoryLabels}
              defaultSelected={0}
              orientation={isMobile ? "horizontal" : "vertical"}
              hideLabels={isMobile}
              textColor={theme === 'dark' ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 0, 0, 0.35)'}
              activeColor={theme === 'dark' ? '#ffffff' : '#0a0a0c'}
              side={isMobile ? "left" : "left"}
              fontSize={isMobile ? 1.65 : 2.8}
              spacing={1.5}
              curve={1}
              tilt={isMobile ? 4 : 7}
              blur={isMobile ? 1.5 : 2.5}
              fade={0.3}
              minOpacity={0.04}
              smoothing={isMobile ? 140 : 180}
              inset={isMobile ? 0 : 64}
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
