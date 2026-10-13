import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import HomePage from './pages/HomePage';
import GalleryPage from './pages/GalleryPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LoaderScreen from './components/LoaderScreen';
import GooeyNav from './components/GooeyNav';
import ThemeToggle from './components/ThemeToggle';
import ErrorBoundary from './components/ErrorBoundary';

import './App.css';

/** Must match OptionWheel reel-spin exit (~1100ms). */
const HOME_EXIT_MS = 1200;

function isMobileDevice() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(max-width: 768px)').matches ||
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  );
}

function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('portfolio_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    }
    return 'light'; // Mặc định là nền trắng theo yêu cầu
  });

  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [navActiveIndex, setNavActiveIndex] = useState(0);

  const [isExitingHome, setIsExitingHome] = useState(false);
  const exitTimerRef = useRef(null);
  const loaderDoneRef = useRef(false);
  const mobile = useMemo(() => isMobileDevice(), []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio_theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  useEffect(() => () => {
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
  }, []);

  const handleLoaderComplete = useCallback(() => {
    if (loaderDoneRef.current) return;
    loaderDoneRef.current = true;
    // Defer one frame so loader unmount + home mount aren't in the same paint
    requestAnimationFrame(() => {
      setIsLoading(false);
    });
  }, []);

  const navItems = useMemo(() => [
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
      label: 'Service',
      href: '#service',
      onClick: () => {
        setNavActiveIndex(2);
        setCurrentPage('contact');
      }
    }
  ], []);

  const handleCategorySelect = useCallback((category) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setSelectedCategory(category);
    setIsExitingHome(true);

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
    setCurrentPage('home');
    setTimeout(() => {
      setIsExitingHome(false);
      setSelectedCategory(null);
      setIsTransitioning(false);
    }, 100);
  }, [isTransitioning]);

  return (
    <div className="app" data-theme={theme}>
      {isLoading && (
        <LoaderScreen theme={theme} onComplete={handleLoaderComplete} />
      )}

      {!isLoading && (
        <ErrorBoundary>
          {currentPage !== 'gallery' && (
            <div className="app-top-bar">
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
              <GooeyNav
                items={navItems}
                particleCount={mobile ? 0 : 10}
                particleDistances={mobile ? [0, 0] : [90, 10]}
                particleR={mobile ? 0 : 800}
                initialActiveIndex={navActiveIndex}
                animationTime={600}
                timeVariance={mobile ? 0 : 1700}
                colors={theme === 'light' ? [4, 4, 4, 4] : [1, 2, 3, 1, 2, 3, 1, 4]}
              />
            </div>
          )}

          {currentPage === 'gallery' && (
            <div className="gallery-theme-toggle-wrap">
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
            </div>
          )}

          {currentPage !== 'about' && currentPage !== 'contact' && currentPage !== 'gallery' && (
            <div className={`page-wrapper ${isExitingHome ? 'is-gallery-active' : ''}`}>
              <HomePage
                theme={theme}
                onCategorySelect={handleCategorySelect}
                isExiting={isExitingHome}
              />
            </div>
          )}

          {currentPage === 'about' && <AboutPage theme={theme} />}
          {currentPage === 'contact' && <ContactPage theme={theme} />}
          {currentPage === 'gallery' && selectedCategory && (
            <GalleryPage theme={theme} category={selectedCategory} onBack={handleBack} />
          )}
        </ErrorBoundary>
      )}
    </div>
  );
}

export default App;
