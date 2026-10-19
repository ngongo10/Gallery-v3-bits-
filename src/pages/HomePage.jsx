import { lazy, Suspense, useState, useEffect, useRef, useMemo, useCallback } from "react";
import MobileDiscHome from "../components/MobileDiscHome";

import ModeLoadingOverlay from "../components/ModeLoadingOverlay";
import { categories, allItems } from "../data/portfolio";
import "./HomePage.css";

const OptionWheel = lazy(() => import("../components/OptionWheel"));
const DriftWall = lazy(() => import("../components/DriftWall"));
const HomeMosaic = lazy(() => import("../components/HomeMosaic"));

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
  const [isLoaded, setIsLoaded] = useState(false);

  // ── Mobile detection (≤768px) ──────────────────────────────────────
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
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
  const driftItems = useMemo(() => {
    const categoryItems = allItems.filter((i) => i.category === selectedCategory?.id);
    const baseItems =
      categoryItems.length >= 4 ? categoryItems : categoryItems.concat(allItems.slice(0, 8));
    return baseItems;
  }, [selectedCategory?.id]);

  const effectiveMode = transitioning ? mode : mode; // current visible mode

  return (
    <div className={`home-page home-page--${effectiveMode}`}>


      {/* ── ART / WORK mode ── */}
      {effectiveMode === "art" && (
        <>
          {isMobile ? (
            /* ── Mobile: Disc Cascade Carousel (Vinyl Album Style) ── */
            <MobileDiscHome
              categories={artCategories}
              allItems={allItems}
              onCategorySelect={handleCategorySelect}
              theme={theme}
            />
          ) : (
            /* ── Desktop: DriftWall + OptionWheel ── */
            <>
              <div className={`home-driftwall${isLoaded ? " is-revealed" : ""}${isChanging ? " is-changing" : ""}`}>
                <Suspense fallback={null}>
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
                </Suspense>
              </div>

              <div className="home-wheel">
                <Suspense fallback={null}>
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
                </Suspense>
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
        <Suspense fallback={null}>
          <HomeMosaic
            items={memoriesItems}
            onItemClick={handleMemoriesItemClick}
          />
        </Suspense>
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
