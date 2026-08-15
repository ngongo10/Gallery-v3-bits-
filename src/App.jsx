import { useState, useCallback, useRef, useEffect } from 'react';
import HomePage from './pages/HomePage';
import GalleryPage from './pages/GalleryPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LoaderScreen from './components/LoaderScreen';
import GooeyNav from './components/GooeyNav';

import './App.css';

/** Must match OptionWheel reel-spin exit (~1100ms). */
const HOME_EXIT_MS = 1200;

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [navActiveIndex, setNavActiveIndex] = useState(0);

  const [isExitingHome, setIsExitingHome] = useState(false);
  const exitTimerRef = useRef(null);

  useEffect(() => () => {
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
  }, []);

  const navItems = [
    {
      label: 'Home',
      href: '#home',
      onClick: () => {
        if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
        setNavActiveIndex(0);
        setIsExitingHome(false);
        setSelectedCategory(null);
        setIsTransitioning(false);
        setCurrentPage('home');
      }
    },
    {
      label: 'About',
      href: '#about',
      onClick: () => {
        setNavActiveIndex(1);
        setCurrentPage('about');
      }
    },
    {
      label: 'Contact',
      href: '#contact',
      onClick: () => {
        setNavActiveIndex(2);
        setCurrentPage('contact');
      }
    }
  ];

  const handleCategorySelect = useCallback((category) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setSelectedCategory(category);
    // Phase 1: play OptionWheel focus-collapse + home exit fully
    setIsExitingHome(true);

    // Phase 2: only mount Gallery after exit finishes
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    exitTimerRef.current = setTimeout(() => {
      setCurrentPage('gallery');
      setIsTransitioning(false);
    }, HOME_EXIT_MS);
  }, [isTransitioning]);

  const handleBack = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    // Hide GalleryPage and restore HomePage
    setCurrentPage('home');
    setTimeout(() => {
      setIsExitingHome(false);
      setSelectedCategory(null);
      setIsTransitioning(false);
    }, 100);
  }, [isTransitioning]);

  return (
    <div className="app">


      {/* Full Preloader Screen */}
      {isLoading && (
        <LoaderScreen onComplete={() => setIsLoading(false)} />
      )}

      {!isLoading && (
        <>
          {/* Navigation */}
          {currentPage !== 'gallery' && (
<div
  style={{
    position: 'absolute',
    top: '2rem',
    right: '2rem',
    zIndex: 100
  }}
>              <GooeyNav
                items={navItems}
                particleCount={10}
                particleDistances={[90, 10]}
                particleR={800}
                initialActiveIndex={navActiveIndex}
                animationTime={600}
                timeVariance={1700}
                colors={[1, 2, 3, 1, 2, 3, 1, 4]}
              />
            </div>
          )}

          {/* Main Pages — hide home once gallery is mounted (exit already finished) */}
          {currentPage !== 'about' && currentPage !== 'contact' && currentPage !== 'gallery' && (
            <div className={`page-wrapper ${isExitingHome ? 'is-gallery-active' : ''}`}>
              <HomePage
                onCategorySelect={handleCategorySelect}
                isExiting={isExitingHome}
              />
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
