import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import MorphSlider from '../components/MorphSlider';
import './GalleryPage.css';

/* ─── Typewriter Component (Cho ảnh 1) ─── */
const TypewriterText = ({ text = '', trigger = false, speed = 28 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (trigger && !hasStarted) {
      setHasStarted(true);
    }
  }, [trigger, hasStarted]);

  useEffect(() => {
    if (!hasStarted) {
      setDisplayedText('');
      return;
    }

    let currentIndex = 0;
    setDisplayedText('');

    const interval = setInterval(() => {
      currentIndex += 1;
      setDisplayedText(text.slice(0, currentIndex));
      if (currentIndex >= text.length) {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [hasStarted, text, speed]);

  if (!hasStarted) return null;

  return (
    <span>
      {displayedText}
      {displayedText.length < text.length && (
        <span className="typewriter-cursor">|</span>
      )}
    </span>
  );
};

/* ─── Matrix + Typewriter Component (Cho ảnh thứ 2 trở đi) ─── */
const MATRIX_CHARS = 'アイウエオカキクケコサシスセソタチツテト0123456789ABCDEF$#%&*<>[]{}@!?/\\';

const MatrixTypewriterText = ({ text = '', trigger = false, speed = 35 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (trigger && !hasStarted) {
      setHasStarted(true);
    }
  }, [trigger, hasStarted]);

  useEffect(() => {
    if (!hasStarted || !text) {
      setDisplayedText('');
      return;
    }

    let step = 0;
    const maxSteps = text.length * 3; // Mỗi ký tự sẽ scramble vài vòng trước khi cố định

    const interval = setInterval(() => {
      step++;
      const resolvedIndex = Math.floor(step / 3);

      if (resolvedIndex >= text.length) {
        setDisplayedText(text);
        setIsDone(true);
        clearInterval(interval);
        return;
      }

      // Tạo chuỗi kết hợp: Phần đã giải mã + 1 ký tự Matrix đang scramble
      let currentOutput = text.slice(0, resolvedIndex);
      const randomChar = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
      currentOutput += randomChar;

      setDisplayedText(currentOutput);
    }, speed);

    return () => clearInterval(interval);
  }, [hasStarted, text, speed]);

  if (!hasStarted) return null;

  return (
    <span className="matrix-typewriter">
      {displayedText}
      {!isDone && <span className="matrix-cursor typewriter-cursor">_</span>}
    </span>
  );
};

/* ─── Category descriptions ─── */
const CATEGORY_DESC = {
  'portrait': 'Faces, feelings, and fleeting expressions in soft light.',
  'run-away': 'Một chuyến đi tự thân tới 1 vài điểm du lịch tại thái nguyên.',
};

const GalleryPage = ({ category, onBack }) => {
  const pageRef = useRef(null);
  const imageRefs = useRef([]);
  const leftColRef = useRef(null);
  const rightColRef = useRef(null);
  const isSyncingRef = useRef(false);
  const [showDetailMode, setShowDetailMode] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth <= 768 : false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const items = category?.items || [];
  const morphItems = useMemo(
    () => items.map(({ image, caption }) => ({ image, caption })),
    [items]
  );

  // Lens bloom entrance
  useEffect(() => {
    if (!category) return;
    const el = pageRef.current;
    if (!el) return;
    el.classList.remove('gallery-page--entered');
    if (isMobile) {
      el.classList.add('gallery-page--entered');
      return;
    }
    // Double rAF so the browser paints the start state before transitioning
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.classList.add('gallery-page--entered');
      });
    });
  }, [category, isMobile]);

  // Scroll spy when in Detail Mode (update active index by IntersectionObserver on left column)
  useEffect(() => {
    if (!showDetailMode) return;

    const observers = [];
    imageRefs.current.forEach((el, index) => {
      if (!el) return;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActivePhotoIndex(index);
            }
          });
        },
        { root: leftColRef.current, threshold: 0.5 }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, [showDetailMode, category]);

  // Sync scroll: left col drives right col
  const handleLeftScroll = useCallback(() => {
    const left = leftColRef.current;
    const right = rightColRef.current;
    if (!left || !right || isSyncingRef.current) return;
    isSyncingRef.current = true;
    const ratio = left.scrollTop / (left.scrollHeight - left.clientHeight || 1);
    right.scrollTop = ratio * (right.scrollHeight - right.clientHeight);
    requestAnimationFrame(() => { isSyncingRef.current = false; });
  }, []);

  // Sync scroll: right col drives left col
  const handleRightScroll = useCallback(() => {
    const left = leftColRef.current;
    const right = rightColRef.current;
    if (!left || !right || isSyncingRef.current) return;
    isSyncingRef.current = true;
    const ratio = right.scrollTop / (right.scrollHeight - right.clientHeight || 1);
    left.scrollTop = ratio * (left.scrollHeight - left.clientHeight);
    requestAnimationFrame(() => { isSyncingRef.current = false; });
  }, []);

  // Attach / detach scroll listeners when detail mode changes
  useEffect(() => {
    const left = leftColRef.current;
    const right = rightColRef.current;
    if (!showDetailMode || !left || !right) return;

    left.addEventListener('scroll', handleLeftScroll, { passive: true });
    right.addEventListener('scroll', handleRightScroll, { passive: true });
    return () => {
      left.removeEventListener('scroll', handleLeftScroll);
      right.removeEventListener('scroll', handleRightScroll);
    };
  }, [showDetailMode, handleLeftScroll, handleRightScroll]);

  // Handle clicking a thumbnail in thumbnail rail
  const handleThumbnailClick = (index) => {
    const target = imageRefs.current[index];
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  if (!category) return null;

  return (
    <div className={`gallery-page${isMobile ? ' gallery-page--mobile' : ''}`} ref={pageRef}>
      {/* Back button */}
      <button
        className="gallery-back-btn"
        onClick={() => {
          if (showDetailMode) {
            setShowDetailMode(false);
          } else {
            onBack();
          }
        }}
        aria-label="Back"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>{showDetailMode ? 'GALLERY' : 'BACK'}</span>
      </button>

      {/* Bottom Left INFO Button */}
      <button
        className={`gallery-info-btn${showDetailMode ? ' active' : ''}`}
        onClick={() => setShowDetailMode(v => !v)}
        aria-label="Toggle Detail Mode"
        aria-expanded={showDetailMode}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span>{showDetailMode ? 'CLOSE INFO' : 'INFO'}</span>
      </button>

      {/* Header Overlay in standard MorphSlider view (Clean view without Collection text & Album title) */}
      {!showDetailMode && (
        <div className="gallery-header">
          <p className="gallery-count">{items.length} ITEMS</p>
        </div>
      )}

      {/* Blurred backdrop behind photos — MorphSlider + INFO */}
      <div
        className="gallery-blurred-bg"
        style={{
          backgroundImage: items[activePhotoIndex]?.image ? `url("${items[activePhotoIndex].image}")` : 'none'
        }}
        aria-hidden="true"
      />

      {/* MODE 1: MorphSlider (React Bits) */}
      <div className={`gallery-slider-wrap${showDetailMode ? ' hide-slider' : ''}`}>
        <MorphSlider
          items={morphItems}
          transition="melt"
          intensity={isMobile ? 0.5 : 1.2}
          aberration={isMobile ? 0 : 0.35}
          drift={0}
          autoplay={!isMobile}
          overlayColor="#000000"
          scale={isMobile ? 1.2 : 2.5}
          showCaptions={false}
          radius={0}
          onIndexChange={setActivePhotoIndex}
        />
      </div>

      {/* MODE 2: Detail Mode Layout */}
      {/* Thumbnail Rail on LEFT (Dot on left, thumbnail on right) */}
      <div className={`gallery-detail-view${showDetailMode ? ' active' : ''}`}>
        <div className="chry-thumbnail-rail left-rail">
          {items.map((photo, i) => {
            const isActive = i === activePhotoIndex;
            return (
              <button
                key={photo.id || i}
                type="button"
                className={`chry-thumb-wrapper${isActive ? ' is-active' : ''}`}
                onClick={() => handleThumbnailClick(i)}
                aria-label={`Jump to photo ${i + 1}`}
              >
                {isActive && <div className="chry-active-dot dot-left" />}
                <img
                  src={photo.image}
                  alt={`${category.label} thumbnail ${i + 1}`}
                  className="chry-thumb-img"
                />
              </button>
            );
          })}
        </div>

        {/* Main Section: Image Column on Left + Scroll-synced Text Column on Right */}
        <div className="chry-gallery-container split-container">
          {/* Mobile view: Stacked photo with its corresponding story right below it */}
          {isMobile ? (
            <div className="chry-mobile-stream" ref={leftColRef}>
              {/* Mobile Album Header */}
              <div className="chry-mobile-header">
                <span className="chry-intro-tag">ALBUM STORY</span>
                <h2 className="chry-intro-title">{category.label}</h2>
                <p className="chry-intro-desc">
                  <TypewriterText
                    text={category.description ?? CATEGORY_DESC[category?.id] ?? 'Visual art portfolio collection captured by JUBISATAKA.'}
                    trigger={showDetailMode}
                    speed={20}
                  />
                </p>
                <div className="chry-story-divider" />
              </div>

              {items.map((photo, i) => (
                <div
                  key={photo.id || i}
                  ref={(el) => (imageRefs.current[i] = el)}
                  className="chry-mobile-item"
                >
                  <div className="chry-image-wrapper medium-size">
                    <img
                      src={photo.image}
                      alt={`${category.label} ${i + 1}`}
                      className="chry-gallery-image"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  {photo.storyText && (
                    <div className="chry-photo-story chry-mobile-story">
                      <p className="chry-intro-desc">
                        <MatrixTypewriterText
                          text={photo.storyText}
                          trigger={showDetailMode && activePhotoIndex === i}
                          speed={30}
                        />
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Desktop Left: scrollable image column */}
              <div className="chry-image-column left-column" ref={leftColRef}>
                {items.map((photo, i) => (
                  <div
                    key={photo.id || i}
                    ref={(el) => (imageRefs.current[i] = el)}
                    className="chry-image-wrapper medium-size"
                  >
                    <img
                      src={photo.image}
                      alt={`${category.label} ${i + 1}`}
                      className="chry-gallery-image"
                      loading="eager"
                      decoding="async"
                    />
                  </div>
                ))}
              </div>

              {/* Desktop Right: scroll-synced text column — 1 block per photo, same height as image wrapper */}
              <div className="chry-text-column right-column" ref={rightColRef}>
                {items.map((photo, i) => (
                  <div key={photo.id || i} className="chry-text-block">
                    {/* Album header only in first block */}
                    {i === 0 && (
                      <div className="chry-story-header">
                        <span className="chry-intro-tag">ALBUM STORY</span>
                        <h2 className="chry-intro-title">{category.label}</h2>
                        <p className="chry-intro-desc">
                          <TypewriterText
                            text={category.description ?? CATEGORY_DESC[category?.id] ?? 'Visual art portfolio collection captured by JUBISATAKA.'}
                            trigger={showDetailMode && activePhotoIndex === 0}
                            speed={24}
                          />
                        </p>
                        <div className="chry-story-divider" />
                      </div>
                    )}
                    {/* Custom story text for subsequent photos if provided (Matrix + Typewriter effect) */}
                    {photo.storyText && (
                      <div className="chry-photo-story">
                        <p className="chry-intro-desc">
                          <MatrixTypewriterText
                            text={photo.storyText}
                            trigger={showDetailMode && activePhotoIndex === i}
                            speed={30}
                          />
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Floating Bottom Counter */}
        <div className="chry-counter-float">
          <span>{activePhotoIndex + 1} OF {items.length}</span>
        </div>
      </div>
    </div>
  );
};

export default GalleryPage;
