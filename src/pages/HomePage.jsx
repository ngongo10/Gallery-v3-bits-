import { useState, useEffect, useRef } from 'react';
import OptionWheel from '../components/OptionWheel';
import DriftWall from '../components/DriftWall';
import { categories, allItems } from '../data/portfolio';
import './HomePage.css';

const HomePage = ({ onCategorySelect, isExiting = false }) => {
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isChanging, setIsChanging] = useState(false);
  const changeTimerRef = useRef(null);

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

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Reveal animation once images are fully preloaded
    const timer = setTimeout(() => setIsLoaded(true), 50);
    return () => {
      clearTimeout(timer);
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

  // Filter DriftWall items dynamically based on selectedCategory from OptionWheel
  const driftItems = allItems.filter(i => i.category === selectedCategory.id).length >= 4
    ? allItems.filter(i => i.category === selectedCategory.id)
    : allItems.filter(i => i.category === selectedCategory.id).concat(allItems.slice(0, 10));

  return (
    <div className="home-page">
      {/* Background DriftWall */}
      <div className={`home-driftwall${isLoaded ? ' is-revealed' : ''}${isChanging ? ' is-changing' : ''}`}>
        <DriftWall
          key={selectedCategory.id}
          items={driftItems}
          columns={2}
          tileWidth={144}
          tileHeight={172}
          gap={18}
          tilt={30}
          turn={-30}
          perspective={900}
          depth={400}
          speed={isChanging ? 180 : 58}
          direction="up"
          variance={0.4}
          parallax={2}
          lift={108}
          fade={0.25}
          dim={0.35}
          overlayColor="#060010"
          radius={8}
          roll={5}
          onTileClick={handleCategorySelect}
        />
      </div>



      {/* Center-left OptionWheel */}
      <div className="home-wheel">
        <OptionWheel
          items={categoryLabels}
          defaultSelected={0}
          textColor="rgba(255,255,255,0.3)"
          activeColor="#ffffff"
          side="left"
          fontSize={2.8}
          spacing={1.5}
          curve={1}
          tilt={7}
          blur={2.5}
          fade={0.3}
          minOpacity={0.04}
          smoothing={180}
          inset={0}
          loop={false}
          draggable={!isExiting}
          exiting={isExiting}
          onChange={handleWheelChange}
          onItemClick={(idx) => handleCategorySelect(categories[idx])}
        />
      </div>

      {/* Bottom info */}
      <div className="home-footer">
        <span className="home-footer-text">Scroll or drag to explore</span>
        <span className="home-footer-dot" />
        <span className="home-footer-text">Click to open</span>
      </div>
    </div>
  );
};

export default HomePage;
