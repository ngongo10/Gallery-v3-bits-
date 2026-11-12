import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import ImageLightbox from '../components/ImageLightbox';
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

const GalleryPage = ({ category, onBack, theme, heroSrc, rawCover, onSlotReady, onHeroLand }) => {
  const pageRef = useRef(null);
  const imageRefs = useRef([]);
  const leftColRef = useRef(null);
  const rightColRef = useRef(null);
  const isSyncingRef = useRef(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [lightboxOriginRect, setLightboxOriginRect] = useState(null);
  const [liftedPhotoIndex, setLiftedPhotoIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth <= 768 : false));
  const [heroSlotHidden, setHeroSlotHidden] = useState(Boolean(heroSrc));
  const [heroRevealed, setHeroRevealed] = useState(Boolean(heroSrc));
  const heroSlotRef = useRef(null);
  const slotReportedRef = useRef(false);

  const heroSlotIdx = useMemo(() => {
    if (!category?.items?.length) return 0;
    if (rawCover) {
      const idx = category.items.findIndex(item => item.image === rawCover);
      if (idx >= 0) return idx;
    }
    if (heroSrc) {
      const idx = category.items.findIndex(item => item.image === heroSrc);
      if (idx >= 0) return idx;
    }
    return 0;
  }, [heroSrc, rawCover, category]);

  const handleOpenLightbox = useCallback((index, e) => {
    // Capture exact <img> element bounding rect for true FLIP animation
    let originRect = null;
    const targetEl = e?.currentTarget || imageRefs.current[index];
    if (targetEl) {
      const imgEl = targetEl.querySelector('img') || targetEl;
      const r = imgEl.getBoundingClientRect();
      originRect = {
        left: r.left,
        top: r.top,
        width: r.width,
        height: r.height,
        borderRadius: window.getComputedStyle(imgEl).borderRadius || '0px'
      };
    }
    setLightboxOriginRect(originRect);
    setLightboxIndex(index);
    setLiftedPhotoIndex(index);
    setActivePhotoIndex(index);
  }, []);

  const handleCloseLightbox = useCallback(() => {
    setLightboxIndex(null);
    setLightboxOriginRect(null);
    // Restore lifted photo after close animation finishes
    setLiftedPhotoIndex(null);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const items = category?.items || [];
  
  // Mobile image optimizer: use w_800 on mobile to prevent Safari WebGL OOM crash
  const getOptimizedUrl = useCallback((url, forMobile = false) => {
    if (!url || !forMobile) return url;
    if (url.includes('res.cloudinary.com')) {
      const parts = url.split('/upload/');
      if (parts.length === 2) {
        return `${parts[0]}/upload/f_auto,q_auto,w_800,c_limit/${parts[1].replace(/^(f_auto,q_auto,[^/]+\/)/, '')}`;
      }
    }
    return url;
  }, []);

  // Entrance
  useEffect(() => {
    if (!category) return;
    const el = pageRef.current;
    if (!el) return;
    el.classList.remove('gallery-page--entered');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.classList.add('gallery-page--entered');
      });
    });
  }, [category]);

  // Locate target slot, hide slot & report bounding rect for FLIP
  useEffect(() => {
    if (!heroSrc || !category?.items?.length || slotReportedRef.current) return;

    setHeroSlotHidden(true);

    // Chờ 680ms để trang Gallery hoàn tất trượt translateX(100% -> 0) ổn định
    // (CSS transition là 650ms, đợi 680ms đảm bảo trang đứng im hoàn toàn trước khi đo)
    setTimeout(() => {
      const slotEl = heroSlotRef.current;
      if (!slotEl) return;

      if (heroSlotIdx > 0) {
        slotEl.scrollIntoView({ behavior: 'instant', block: 'center' });
      }

      requestAnimationFrame(() => {
        const doMeasure = () => {
          if (slotReportedRef.current) return;
          // Đo chính xác phần tử <img> thực tế của ảnh (thay vì khung wrapper)
          const imgEl = slotEl.querySelector('img');
          let rect = null;
          if (imgEl) {
            const r = imgEl.getBoundingClientRect();
            if (r.width > 20 && r.height > 20) {
              rect = r;
            }
          }
          if (!rect) {
            const targetEl = slotEl.querySelector('.chry-image-wrapper') || slotEl;
            rect = targetEl.getBoundingClientRect();
          }

          slotReportedRef.current = true;
          onSlotReady?.({
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
          });

          // Sau khi hoàn thành bay & căn chỉnh, kích hoạt land
          setTimeout(() => {
            onHeroLand?.();
            setHeroSlotHidden(false);
            const slotItemEl = heroSlotRef.current;
            if (slotItemEl) slotItemEl.classList.add('is-in-view');
          }, 1100);
        };

        const imgEl = slotEl.querySelector('img');
        if (imgEl && (!imgEl.complete || imgEl.naturalWidth === 0)) {
          imgEl.addEventListener('load', () => requestAnimationFrame(doMeasure), { once: true });
          imgEl.addEventListener('error', () => requestAnimationFrame(doMeasure), { once: true });
        } else {
          doMeasure();
        }
      });
    }, 680);
  }, [heroSrc, category, onSlotReady, onHeroLand]);

  // Scroll spy (update active index by IntersectionObserver on left column)
  useEffect(() => {
    const observers = [];
    imageRefs.current.forEach((el, index) => {
      if (!el) return;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActivePhotoIndex(index);
              entry.target.classList.add('is-in-view');
            }
          });
        },
        { root: isMobile ? null : leftColRef.current, threshold: 0.3 }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, [category, isMobile]);

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

  // Attach / detach scroll listeners
  useEffect(() => {
    const left = leftColRef.current;
    const right = rightColRef.current;
    if (!left || !right) return;

    left.addEventListener('scroll', handleLeftScroll, { passive: true });
    right.addEventListener('scroll', handleRightScroll, { passive: true });
    return () => {
      left.removeEventListener('scroll', handleLeftScroll);
      right.removeEventListener('scroll', handleRightScroll);
    };
  }, [handleLeftScroll, handleRightScroll]);

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
        onClick={onBack}
        aria-label="Back"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>BACK</span>
      </button>

      {/* Main Gallery / Stream View */}
      <div className="gallery-detail-view active">
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
                    trigger={isMobile || showDetailMode}
                    speed={20}
                  />
                </p>
                <div className="chry-story-divider" />
              </div>

              {items.map((photo, i) => (
                <div
                  key={photo.id || i}
                  ref={(el) => {
                    imageRefs.current[i] = el;
                    if (i === heroSlotIdx) heroSlotRef.current = el;
                  }}
                  className={`chry-mobile-item${i === heroSlotIdx ? ' is-in-view' : ''}${i === heroSlotIdx && heroRevealed ? ' hero-revealed' : ''}`}
                  style={i === heroSlotIdx && heroSlotHidden ? { visibility: 'hidden' } : undefined}
                >
                  <div
                    className="chry-image-wrapper medium-size"
                    onClick={(e) => handleOpenLightbox(i, e)}
                    style={{ cursor: 'pointer' }}
                  >
                    <img
                      src={getOptimizedUrl(photo.image, true)}
                      alt={`${category.label} ${i + 1}`}
                      className={`chry-gallery-image chry-zoomable${liftedPhotoIndex === i ? ' is-lifted-away' : ''}`}
                      loading={i === heroSlotIdx ? "eager" : "lazy"}
                      decoding="async"
                    />
                  </div>
                  {photo.storyText && (
                    <div className="chry-photo-story chry-mobile-story">
                      <p className="chry-intro-desc">
                        <MatrixTypewriterText
                          text={photo.storyText}
                          trigger={true}
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
                    onClick={(e) => handleOpenLightbox(i, e)}
                    style={{ cursor: 'pointer' }}
                  >
                    <img
                      src={photo.image}
                      alt={`${category.label} ${i + 1}`}
                      className={`chry-gallery-image chry-zoomable${liftedPhotoIndex === i ? ' is-lifted-away' : ''}`}
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
                            trigger={true}
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
                            trigger={activePhotoIndex === i}
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
          <span className="chry-zoom-hint">↕ Chạm ảnh để phóng to</span>
        </div>
      </div>

      {/* Lightbox — renders on top of everything */}
      {lightboxIndex !== null && (
        <ImageLightbox
          items={items}
          initialIndex={lightboxIndex}
          originRect={lightboxOriginRect}
          onClose={handleCloseLightbox}
          onChangeIndex={(idx) => {
            setActivePhotoIndex(idx);
            setLiftedPhotoIndex(idx);
          }}
        />
      )}


    </div>
  );
};

export default GalleryPage;
