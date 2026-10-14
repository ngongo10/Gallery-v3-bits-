import { useRef, useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import "./ThreeDHoverGallery.css";

const DEFAULT_ITEMS = [
  {
    url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=compress&cs=tinysrgb&w=800&q=80",
    title: "Neo Tokyo",
    category: "Cyberpunk",
    description: "Immersive neon skylines and futuristic streets glowing in the rain.",
    glow: "rgba(236,72,153,0.35)"
  },
  {
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=compress&cs=tinysrgb&w=800&q=80",
    title: "Ethereal Flow",
    category: "Abstract Art",
    description: "Sleek flowing shapes with high-contrast pastel fluid textures.",
    glow: "rgba(6,182,212,0.35)"
  },
  {
    url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=compress&cs=tinysrgb&w=800&q=80",
    title: "Quantum Nexus",
    category: "Sci-Fi",
    description: "Interstellar data nodes mapping out the universe's connections.",
    glow: "rgba(139,92,246,0.35)"
  },
  {
    url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=compress&cs=tinysrgb&w=800&q=80",
    title: "Surreal Oasis",
    category: "Digital Art",
    description: "Floating islands and dreamlike columns rising from serene oceans.",
    glow: "rgba(245,158,11,0.35)"
  }
];

const ThreeDHoverGallery = ({
  images,
  items,
  itemHeight = 380,
  gap = 10,
  perspective = 900,
  hoverScale = 1.05,
  transitionDuration = 0.45,
  enableKeyboardNavigation = true,
  autoPlay = false,
  autoPlayDelay = 4000,
  className = "",
  style,
  onImageClick,
  onImageHover,
}) => {
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [focusedIndex, setFocusedIndex] = useState(null);
  const autoPlayTimerRef = useRef(null);

  // Normalize data sources
  const galleryItems = useMemo(() => {
    if (items && items.length > 0) return items;
    if (images && images.length > 0) {
      return images.map((url, index) => {
        const fallback = DEFAULT_ITEMS[index % DEFAULT_ITEMS.length];
        return {
          url,
          title: fallback.title,
          category: fallback.category,
          description: fallback.description,
          glow: fallback.glow
        };
      });
    }
    return DEFAULT_ITEMS;
  }, [images, items]);

  // Handle Autoplay Loop
  useEffect(() => {
    if (autoPlay && galleryItems.length > 0) {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
      autoPlayTimerRef.current = setInterval(() => {
        setActiveIndex((prev) => {
          const nextIndex = prev === null ? 0 : (prev + 1) % galleryItems.length;
          return nextIndex;
        });
      }, autoPlayDelay);

      return () => {
        if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
      };
    }
  }, [autoPlay, autoPlayDelay, galleryItems.length]);

  const handleImageClick = (index, item) => {
    setActiveIndex(index);
    onImageClick?.(index, item);
  };

  const handleImageHover = (index, item) => {
    if (!autoPlay) {
      setActiveIndex(index);
    }
    onImageHover?.(index, item);
  };

  const handleKeyDown = (event, index) => {
    if (!enableKeyboardNavigation) return;

    switch (event.key) {
      case "Enter":
      case " ":
        event.preventDefault();
        handleImageClick(index, galleryItems[index]);
        break;
      case "ArrowLeft": {
        event.preventDefault();
        const prevIndex = index > 0 ? index - 1 : galleryItems.length - 1;
        containerRef.current?.children[prevIndex]?.focus();
        break;
      }
      case "ArrowRight": {
        event.preventDefault();
        const nextIndex = index < galleryItems.length - 1 ? index + 1 : 0;
        containerRef.current?.children[nextIndex]?.focus();
        break;
      }
      case "Escape":
        setActiveIndex(null);
        break;
    }
  };

  return (
    <div
      className={`threed-gallery-wrapper ${className}`}
      style={style}
    >
      <div
        ref={containerRef}
        className="threed-gallery-container"
        style={{
          perspective: `${perspective}px`,
          gap: `${gap}px`,
        }}
      >
        {galleryItems.map((item, index) => {
          const isActive = activeIndex === index;
          const isFocused = focusedIndex === index;

          return (
            <motion.div
              key={index}
              role="button"
              tabIndex={enableKeyboardNavigation ? 0 : -1}
              onClick={() => handleImageClick(index, item)}
              onMouseEnter={() => handleImageHover(index, item)}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(null)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              aria-label={item.title}
              aria-pressed={isActive}
              layout
              animate={{
                rotateY: activeIndex === null ? 0 : index < activeIndex ? 22 : index > activeIndex ? -22 : 0,
              }}
              transition={{
                layout: { type: "spring", stiffness: 120, damping: 18 },
                rotateY: { type: "spring", stiffness: 100, damping: 16 },
              }}
              style={{
                height: typeof itemHeight === "number" ? `${itemHeight}px` : itemHeight,
                zIndex: isActive ? 20 : 10,
                flex: isActive ? 4.8 : 1,
                minWidth: isActive ? "220px" : "48px",
              }}
              className={`threed-gallery-card${isActive ? " is-active" : ""}${isFocused ? " is-focused" : ""}`}
            >
              {/* Outer Neon Shadow Glow when Active */}
              {isActive && item.glow && (
                <div
                  className="threed-gallery-glow"
                  style={{
                    boxShadow: `inset 0 0 20px ${item.glow}, 0 0 15px ${item.glow}`,
                  }}
                />
              )}

              {/* Background Image Container with parallax scale */}
              <motion.div
                animate={{ scale: isActive ? hoverScale : 1.0 }}
                transition={{ duration: transitionDuration, ease: [0.1, 0.7, 0, 1] }}
                className="threed-gallery-bg-img"
                style={{
                  backgroundImage: `url(${item.url})`,
                }}
              />

              {/* Text Readable Gradient Overlay */}
              <div className="threed-gallery-gradient" />

              {/* Dynamic Overlay Content (shown only on active card) */}
              <div className="threed-gallery-content">
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      key={`content-${index}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{ display: "flex", flexDirection: "column", width: "100%" }}
                    >
                      {/* Category */}
                      {item.category && (
                        <motion.span
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 0.9, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          transition={{ duration: 0.25 }}
                          className="threed-gallery-category"
                        >
                          {item.category}
                        </motion.span>
                      )}

                      {/* Title */}
                      <motion.h4
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.25, delay: 0.05 }}
                        className="threed-gallery-title"
                      >
                        {item.title}
                      </motion.h4>

                      {/* Description */}
                      {item.description && (
                        <motion.p
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 0.75, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.25, delay: 0.1 }}
                          className="threed-gallery-desc"
                        >
                          {item.description}
                        </motion.p>
                      )}

                      {/* Explore Arrow button */}
                      <motion.div
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -5 }}
                        transition={{ duration: 0.25, delay: 0.15 }}
                        className="threed-gallery-btn"
                      >
                        <span>Open Gallery</span>
                        <ArrowRight size={12} />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ThreeDHoverGallery;
