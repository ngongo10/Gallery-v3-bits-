import { useEffect, useRef, useState, useMemo } from 'react';
import MorphSlider from '../components/MorphSlider';
import './GalleryPage.css';

/* ─── Category descriptions ─── */
const CATEGORY_DESC = {
  'portrait': 'Faces, feelings, and fleeting expressions in soft light.',
};

const GalleryPage = ({ category, onBack }) => {
  const pageRef = useRef(null);
  const imageRefs = useRef([]);
  const [showDetailMode, setShowDetailMode] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

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
    // Double rAF so the browser paints the start state before transitioning
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.classList.add('gallery-page--entered');
      });
    });
  }, [category]);

  // Scroll spy when in Detail Mode
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
        { threshold: 0.5 }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, [showDetailMode, category]);

  // Handle clicking a thumbnail in thumbnail rail
  const handleThumbnailClick = (index) => {
    const target = imageRefs.current[index];
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  if (!category) return null;

  return (
    <div className="gallery-page" ref={pageRef}>
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
          intensity={1.2}
          aberration={0.35}
          drift={0}
          autoplay
          overlayColor="#000000"
          scale={2.5}
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

        {/* Main Section: Medium/Large Image Column on Left + Text Description on Right */}
        <div className="chry-gallery-container split-container">
          <div className="chry-image-column left-column">
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

          {/* Text Information Column on Right */}
          <div className="chry-text-column right-column">
            <div className="chry-story-card">
              <span className="chry-intro-tag">ALBUM STORY</span>
              <h2 className="chry-intro-title">{category.label}</h2>
              <p className="chry-intro-desc">
                {CATEGORY_DESC[category?.id] ?? 'Visual art portfolio collection captured by JUBISATAKA.'}
              </p>
              <div className="chry-story-divider" />

              {/* Active Image Details */}
              <div className="chry-active-meta">
                <span className="meta-number">{String(activePhotoIndex + 1).padStart(2, '0')}</span>
                <span className="meta-title">
                  {items[activePhotoIndex]?.caption ?? `${category.label} #${activePhotoIndex + 1}`}
                </span>
                <p className="meta-sub">
                  Captured by JUBISATAKA. High resolution visual artwork collection.
                </p>
              </div>
            </div>
          </div>
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
