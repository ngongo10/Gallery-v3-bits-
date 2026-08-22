import { useState, useEffect, useRef, useMemo } from 'react';
import OptionWheel from '../components/OptionWheel';
import DriftWall from '../components/DriftWall';
import { categories, allItems } from '../data/portfolio';
import './HomePage.css';

function isMobileDevice() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(max-width: 768px)').matches ||
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  );
}

const HomePage = ({ onCategorySelect, isExiting = false }) => {
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isChanging, setIsChanging] = useState(false);
  const changeTimerRef = useRef(null);
  const isMobile = useMemo(() => isMobileDevice(), []);
  const [isLoaded, setIsLoaded] = useState(false);

  const categoryLabels = categories.map(c => c.label);

  const handleWheelChange = (index) => {
    setIsChanging(true);
    clearTimeout(changeTimerRef.current);

    changeTimerRef.current = setTimeout(() => {
      setSelectedCategory(categories[index]);
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

  const handleCategorySelect = (itemOrCat) => {
    let target = selectedCategory;
    if (itemOrCat) {
      if (itemOrCat.category) {
        const found = categories.find(c => c.id === itemOrCat.category);
        if (found) target = found;
      } else if (itemOrCat.id) {
        target = itemOrCat;
      }
    }
    if (onCategorySelect) onCategorySelect(target);
  };

  const categoryItems = allItems.filter((i) => i.category === selectedCategory.id);
  const baseItems =
    categoryItems.length >= 4
      ? categoryItems
      : categoryItems.concat(allItems.slice(0, 8));
  const driftItems = isMobile ? baseItems.slice(0, 4) : baseItems;

  return (
    <div className={`home-page${isMobile ? ' home-page--mobile' : ''}`}>
      <div className={`home-driftwall${isLoaded ? ' is-revealed' : ''}${isChanging ? ' is-changing' : ''}`}>
        <DriftWall
          key={selectedCategory.id}
          items={driftItems}
          columns={isMobile ? 1 : 2}
          tileWidth={isMobile ? 110 : 144}
          tileHeight={isMobile ? 140 : 172}
          gap={isMobile ? 12 : 18}
          tilt={isMobile ? 12 : 30}
          turn={isMobile ? -12 : -30}
          perspective={isMobile ? 600 : 900}
          depth={isMobile ? 120 : 400}
          speed={isChanging ? 120 : isMobile ? 28 : 58}
          direction="up"
          variance={0.35}
          parallax={isMobile ? 0.4 : 2}
          lift={isMobile ? 36 : 108}
          fade={0.25}
          dim={0.35}
          overlayColor="#060010"
          radius={8}
          roll={isMobile ? 0 : 5}
          onTileClick={handleCategorySelect}
        />
      </div>

      <div className="home-wheel">
        <OptionWheel
          items={categoryLabels}
          defaultSelected={0}
          textColor="rgba(255,255,255,0.3)"
          activeColor="#ffffff"
          side={isMobile ? 'right' : 'left'}
          fontSize={isMobile ? 1.65 : 2.8}
          spacing={1.5}
          curve={1}
          tilt={isMobile ? 4 : 7}
          blur={isMobile ? 1.5 : 2.5}
          fade={0.3}
          minOpacity={0.04}
          smoothing={isMobile ? 140 : 180}
          inset={isMobile ? 8 : 0}
          loop={false}
          draggable={!isExiting}
          exiting={isExiting}
          onChange={handleWheelChange}
          onItemClick={(idx) => handleCategorySelect(categories[idx])}
        />
      </div>

      <div className="home-footer">
        <span className="home-footer-text">Scroll or drag to explore</span>
        <span className="home-footer-dot" />
        <span className="home-footer-text">Click to open</span>
      </div>
    </div>
  );
};

export default HomePage;
