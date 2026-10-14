import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import HomePage from './pages/HomePage';
import GalleryPage from './pages/GalleryPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LoaderScreen from './components/LoaderScreen';
import GooeyNav from './components/GooeyNav';
import AnimatedThemeToggler from './components/AnimatedThemeToggler';
import ModeToggle from './components/ModeToggle';
import FlickeringText from './components/ui/flickering-text';
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

  const mobile = useMemo(() => isMobileDevice(), []);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(() => (isMobileDevice() ? 'contact' : 'home'));
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [navActiveIndex, setNavActiveIndex] = useState(() => (isMobileDevice() ? 1 : 0));

  const [isExitingHome, setIsExitingHome] = useState(false);
  const exitTimerRef = useRef(null);
  const loaderDoneRef = useRef(false);

  // Mode state (WORK vs MEMORIES)
  const [homeMode, setHomeMode] = useState('art');
  const [pendingMode, setPendingMode] = useState(null);
  const [transitioningMode, setTransitioningMode] = useState(false);

  const handleModeChange = useCallback((newMode) => {
    if (newMode === homeMode || transitioningMode) return;
    setPendingMode(newMode);
    setTransitioningMode(true);
  }, [homeMode, transitioningMode]);

  const handleModeTransitionDone = useCallback(() => {
    if (pendingMode) {
      setHomeMode(pendingMode);
      setPendingMode(null);
    }
    setTransitioningMode(false);
  }, [pendingMode]);

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

  const navItems = useMemo(() => {
    if (mobile) {
      return [
        {
          label: 'Service',
          href: '#service',
          onClick: () => {
            setNavActiveIndex(0);
            setCurrentPage('contact');
          }
        },
        {
          label: 'About',
          href: '#about',
          onClick: () => {
            setNavActiveIndex(1);
            setCurrentPage('about');
          }
        }
      ];
    }

    return [
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
    ];
  }, [mobile]);

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
    const targetPage = mobile ? 'contact' : 'home';
    setCurrentPage(targetPage);
    setNavActiveIndex(0);
    setTimeout(() => {
      setIsExitingHome(false);
      setSelectedCategory(null);
      setIsTransitioning(false);
    }, 100);
  }, [isTransitioning, mobile]);

  const handleLogoClick = useCallback(() => {
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    setNavActiveIndex(0);
    setIsExitingHome(false);
    setSelectedCategory(null);
    setIsTransitioning(false);
    setCurrentPage(mobile ? 'contact' : 'home');
  }, [mobile]);

  return (
    <div className="app" data-theme={theme}>
      {isLoading && (
        <LoaderScreen theme={theme} onComplete={handleLoaderComplete} />
      )}

      {!isLoading && (
        <ErrorBoundary>
          {currentPage !== 'gallery' && (
            <>
              <div
                className="app-brand-logo"
                onClick={handleLogoClick}
                role="button"
                tabIndex={0}
                aria-label="Jubi Sataka Home"
              >
                <FlickeringText
                  text="JUBI SATAKA"
                  fontSize={mobile ? "0.95rem" : "1.15rem"}
                  fontWeight={700}
                  textColor={theme === 'dark' ? '#ffffff' : '#0a0a0c'}
                  glowColor={theme === 'dark' ? '#ffffff' : '#0a0a0c'}
                  glowIntensity={theme === 'dark' ? 0.8 : 0.35}
                  glowRadius={1.1}
                />
              </div>

              <div className="app-top-bar">
                {/* Desktop: ThemeToggler left of ModeToggle */}
                {!mobile && (
                  <AnimatedThemeToggler theme={theme} onToggle={toggleTheme} />
                )}
                {currentPage !== 'about' && currentPage !== 'contact' && (
                  <ModeToggle mode={homeMode} onChange={handleModeChange} />
                )}
                <GooeyNav
                  items={navItems}
                  theme={theme === 'dark' ? 'dark' : 'light'}
                  frame={true}
                  size="md"
                  particleCount={mobile ? 0 : 15}
                  spread={mobile ? 0 : 56}
                  animationTime={600}
                  timeVariance={mobile ? 0 : 300}
                  gooeyness={0.5}
                  wobble={0.5}
                  hoverEffect={!mobile}
                  initialActiveIndex={navActiveIndex}
                  activeIndex={navActiveIndex}
                  onChange={(index) => {
                    navItems[index]?.onClick?.();
                  }}
                />
              </div>
            </>
          )}

          {mobile && currentPage === 'home' && (
            <div className="app-theme-toggle-bottom">
              <AnimatedThemeToggler theme={theme} onToggle={toggleTheme} />
            </div>
          )}

          {!mobile && currentPage !== 'about' && currentPage !== 'contact' && currentPage !== 'gallery' && (
            <div className={`page-wrapper ${isExitingHome ? 'is-gallery-active' : ''}`}>
              <HomePage
                theme={theme}
                mode={homeMode}
                pendingMode={pendingMode}
                transitioning={transitioningMode}
                onTransitionDone={handleModeTransitionDone}
                onCategorySelect={handleCategorySelect}
                isExiting={isExitingHome}
              />
            </div>
          )}

          {currentPage === 'about' && <AboutPage theme={theme} />}
          {currentPage === 'contact' && (
            <ContactPage
              theme={theme}
              onCategorySelect={(category) => {
                setSelectedCategory(category);
                setCurrentPage('gallery');
              }}
            />
          )}
          {currentPage === 'gallery' && selectedCategory && (
            <GalleryPage theme={theme} category={selectedCategory} onBack={handleBack} />
          )}
        </ErrorBoundary>
      )}
    </div>
  );
}

export default App;
