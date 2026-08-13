import { useState, useCallback } from 'react';
import HomePage from './pages/HomePage';
import GalleryPage from './pages/GalleryPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LoaderScreen from './components/LoaderScreen';
import GooeyNav from './components/GooeyNav';

import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [navActiveIndex, setNavActiveIndex] = useState(0);

  const [isExitingHome, setIsExitingHome] = useState(false);

  const handleCategorySelect = useCallback((category) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setSelectedCategory(category);
    // Phase 1: Trigger OptionWheel retract & DriftWall hide animation on HomePage
    setIsExitingHome(true);

    // Phase 2: Wait 950ms for OptionWheel & DriftWall to completely finish hiding before mounting GalleryPage
    setTimeout(() => {
      setCurrentPage('gallery');
      setIsTransitioning(false);
    }, 950);
  }, [isTransitioning]);

  const handleBack = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    // Hide GalleryPage and restore HomePage
    setCurrentPage('home');
    setTimeout(() => {
      setIsExitingHome(false);
      setSelectedCategory(null);
      setIsTransitioning(false);
    }, 100);
  }, [isTransitioning]);

  const navItems = [
    {
      label: 'Works',
      href: '#',
      onClick: () => {
        setNavActiveIndex(0);
        setCurrentPage('home');
      }
    },
    {
      label: 'About',
      href: '#',
      onClick: () => {
        setNavActiveIndex(1);
        setCurrentPage('about');
      }
    },
    {
      label: 'Contact',
      href: '#',
      onClick: () => {
        setNavActiveIndex(2);
        setCurrentPage('contact');
      }
    }
  ];

  return (
    <div className="app">


      {/* Full Preloader Screen */}
      {isLoading && (
        <LoaderScreen onComplete={() => setIsLoading(false)} />
      )}

      {!isLoading && (
        <>
          {/* Persistent Header: JUBISATAKA Brand & GooeyNav */}
          {currentPage !== 'gallery' && (
            <>
              <div className="home-brand">
                <h1 className="home-brand-name">JUBISATAKA</h1>
              </div>

              <div className="home-nav">
                <GooeyNav
                  items={navItems}
                  particleCount={15}
                  particleDistances={[90, 10]}
                  particleR={100}
                  activeIndex={navActiveIndex}
                  animationTime={600}
                  timeVariance={300}
                  colors={[1, 2, 3, 1, 2, 3, 1, 4]}
                />
              </div>
            </>
          )}

          {/* Main Pages */}
          {currentPage !== 'about' && currentPage !== 'contact' && (
            <div className={`page-wrapper ${isExitingHome || currentPage === 'gallery' ? 'is-gallery-active' : ''}`}>
              <HomePage onCategorySelect={handleCategorySelect} />
            </div>
          )}

          {currentPage === 'about' && (
            <AboutPage />
          )}
          {currentPage === 'contact' && (
            <ContactPage />
          )}
          {currentPage === 'gallery' && selectedCategory && (
            <GalleryPage category={selectedCategory} onBack={handleBack} />
          )}
        </>
      )}
    </div>
  );
}

export default App;
