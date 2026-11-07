import { lazy, Suspense, useState, useCallback, useRef, useEffect, useMemo } from 'react';
import HomePage from './pages/HomePage';
import LoaderScreen from './components/LoaderScreen';
import SimpleMobileNav from './components/SimpleMobileNav';
import AnimatedThemeToggler from './components/AnimatedThemeToggler';
import FlickeringText from './components/ui/flickering-text';
import ErrorBoundary from './components/ErrorBoundary';
import HeroOverlay from './components/HeroOverlay';

import './App.css';

const GooeyNav = lazy(() => import('./components/GooeyNav'));
const ModeToggle = lazy(() => import('./components/ModeToggle'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));

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

  const [mobile, setMobile] = useState(() => isMobileDevice());
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [navActiveIndex, setNavActiveIndex] = useState(0);

  const [isExitingHome, setIsExitingHome] = useState(false);
  const [heroTransition, setHeroTransition] = useState(null); // { src, fromRect }
  const [heroPhase, setHeroPhase] = useState(null); // 'peel' | 'fly' | 'land' | null
  const [heroToRect, setHeroToRect] = useState(null);
  const exitTimerRef = useRef(null);
  const loaderDoneRef = useRef(false);

  // Mode state (WORK vs MEMORIES)
  const [homeMode, setHomeMode] = useState('art');
  const [pendingMode, setPendingMode] = useState(null);
  const [transitioningMode, setTransitioningMode] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const handleViewportChange = () => setMobile(isMobileDevice());
    mediaQuery.addEventListener('change', handleViewportChange);
    return () => mediaQuery.removeEventListener('change', handleViewportChange);
  }, []);

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

  const handleCategorySelect = useCallback((category, heroInfo) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setSelectedCategory(category);
    setIsExitingHome(true);

    if (heroInfo?.src && heroInfo?.fromRect) {
      setHeroTransition(heroInfo);
      setHeroToRect(null);
      setHeroPhase('peel');

      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
      // Wait for peel animation (~320ms), then mount gallery & start fly
      exitTimerRef.current = setTimeout(() => {
        setHeroPhase('fly');
        setCurrentPage('gallery');
        setIsTransitioning(false);
      }, 320);
    } else {
      setHeroTransition(null);
      setHeroPhase(null);
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
      exitTimerRef.current = setTimeout(() => {
        setCurrentPage('gallery');
        setIsTransitioning(false);
      }, 650);
    }
  }, [isTransitioning]);

  const handleSlotReady = useCallback((rect) => {
    setHeroToRect(rect);
    setHeroPhase('fly');
  }, []);

  const handleHeroLand = useCallback(() => {
    setHeroPhase('land');
  }, []);

  const handleHeroDone = useCallback(() => {
    setHeroTransition(null);
    setHeroPhase(null);
    setHeroToRect(null);
  }, []);

  const handleBack = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    // Luon quay ve trang Home (index 0) cho ca mobile va desktop
    setCurrentPage('home');
    setNavActiveIndex(0);
    setTimeout(() => {
      setIsExitingHome(false);
      setSelectedCategory(null);
      setIsTransitioning(false);
    }, 100);
  }, [isTransitioning]);

  const handleLogoClick = useCallback(() => {
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    setNavActiveIndex(0);
    setIsExitingHome(false);
    setSelectedCategory(null);
    setIsTransitioning(false);
    // Luon quay ve trang Home khi click Logo
    setCurrentPage('home');
  }, []);

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
                {/* Desktop: ThemeToggler ở top-bar */}
                {!mobile && (
                  <AnimatedThemeToggler theme={theme} onToggle={toggleTheme} />
                )}
                {mobile ? (
                  <SimpleMobileNav
                    items={navItems}
                    activeIndex={navActiveIndex}
                    onChange={(index) => {
                      navItems[index]?.onClick?.();
                    }}
                  />
                ) : (
                  <Suspense fallback={null}>
                    <GooeyNav
                      items={navItems}
                      theme={theme === 'dark' ? 'dark' : 'light'}
                      frame={true}
                      size="md"
                      particleCount={15}
                      spread={56}
                      animationTime={600}
                      timeVariance={300}
                      gooeyness={0.5}
                      wobble={0.5}
                      hoverEffect={true}
                      initialActiveIndex={navActiveIndex}
                      activeIndex={navActiveIndex}
                      onChange={(index) => {
                        navItems[index]?.onClick?.();
                      }}
                    />
                  </Suspense>
                )}
              </div>
            </>
          )}

          {/* ModeToggle góc dưới phải — chỉ desktop, chỉ trang Home */}
          {!mobile && currentPage !== 'about' && currentPage !== 'contact' && currentPage !== 'gallery' && (
            <div className="app-mode-toggle-bottom">
              <Suspense fallback={null}>
                <ModeToggle mode={homeMode} onChange={handleModeChange} />
              </Suspense>
            </div>
          )}

          {/* Mobile: ThemeToggler góc dưới phải */}
          {mobile && currentPage === 'home' && (
            <div className="app-theme-toggle-bottom">
              <AnimatedThemeToggler theme={theme} onToggle={toggleTheme} />
            </div>
          )}

          {currentPage !== 'about' && currentPage !== 'contact' && currentPage !== 'gallery' && (
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

          {currentPage === 'about' && (
            <Suspense fallback={null}>
              <AboutPage theme={theme} />
            </Suspense>
          )}
          {currentPage === 'contact' && (
            <Suspense fallback={null}>
              <ContactPage
                theme={theme}
                onCategorySelect={(category) => {
                  setSelectedCategory(category);
                  setCurrentPage('gallery');
                }}
              />
            </Suspense>
          )}
          {currentPage === 'gallery' && selectedCategory && (
            <Suspense fallback={null}>
              <GalleryPage
                theme={theme}
                category={selectedCategory}
                onBack={handleBack}
                heroSrc={heroTransition?.src || null}
                onSlotReady={handleSlotReady}
                onHeroLand={handleHeroLand}
              />
            </Suspense>
          )}
        </ErrorBoundary>
      )}

      {/* Hero shared-element transition overlay (Peel -> Fly -> Glow Land) */}
      <HeroOverlay
        heroTransition={heroTransition}
        toRect={heroToRect}
        phase={heroPhase}
        onLandDone={handleHeroDone}
      />
    </div>
  );
}

export default App;
