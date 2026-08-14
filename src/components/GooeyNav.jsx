import { useRef, useEffect, useState } from 'react';
import './GooeyNav.css';

const GooeyNav = ({
  items,
  animationTime = 500,
  particleCount = 12,
  particleDistances = [80, 20],
  particleR = 90,
  timeVariance = 250,
  colors = [1, 2, 3, 4],
  activeIndex: controlledIndex = 0
}) => {
  const containerRef = useRef(null);
  const navRef = useRef(null);
  const pillRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(controlledIndex);
  const prevIndexRef = useRef(controlledIndex);

  const noise = (n = 1) => n / 2 - Math.random() * n;

  const getXY = (distance, pointIndex, totalPoints) => {
    const angle = ((360 + noise(6)) / totalPoints) * pointIndex * (Math.PI / 180);
    return [distance * Math.cos(angle), distance * Math.sin(angle)];
  };

  const createParticle = (i, d, r) => {
    const rotate = noise(r / 8);
    const delay = noise(timeVariance);
    return {
      start: getXY(d[0], particleCount - i, particleCount),
      end: getXY(d[1] + noise(5), particleCount - i, particleCount),
      scale: 0.8 + Math.random() * 0.4,
      color: colors[i % colors.length],
      rotate: rotate > 0 ? (rotate + r / 15) * 8 : (rotate - r / 15) * 8,
      delay
    };
  };

  const makeParticles = (element, liEl) => {
    if (!element) return;
    const d = particleDistances;
    const r = particleR;

    // Get position relative to container
    const containerRect = containerRef.current?.getBoundingClientRect();
    const liRect = liEl.getBoundingClientRect();
    const centerX = liRect.left - containerRect.x + liRect.width / 2;
    const centerY = liRect.top - containerRect.y + liRect.height / 2;

    for (let i = 0; i < particleCount; i++) {
      const p = createParticle(i, d, r);
      const t = animationTime + p.delay;

      setTimeout(() => {
        const particle = document.createElement('span');
        particle.className = 'nav-particle';
        particle.style.setProperty('--center-x', `${centerX}px`);
        particle.style.setProperty('--center-y', `${centerY}px`);
        particle.style.setProperty('--start-x', `${p.start[0]}px`);
        particle.style.setProperty('--start-y', `${p.start[1]}px`);
        particle.style.setProperty('--end-x', `${p.end[0]}px`);
        particle.style.setProperty('--end-y', `${p.end[1]}px`);
        particle.style.setProperty('--time', `${animationTime}ms`);
        particle.style.setProperty('--scale', `${p.scale}`);
        particle.style.setProperty('--color', `var(--color-${p.color})`);
        particle.style.setProperty('--rotate', `${p.rotate}deg`);

        element.appendChild(particle);
        requestAnimationFrame(() => particle.classList.add('active'));

        setTimeout(() => {
          try {
            element.removeChild(particle);
          } catch (e) {
            // Particle already removed
          }
        }, t);
      }, 20);
    }
  };

  const updatePillPosition = (liEl) => {
    if (!pillRef.current || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const liRect = liEl.getBoundingClientRect();

    pillRef.current.style.setProperty(
      '--pill-left',
      `${liRect.left - containerRect.left}px`
    );
    pillRef.current.style.setProperty(
      '--pill-top',
      `${liRect.top - containerRect.top}px`
    );
    pillRef.current.style.setProperty('--pill-width', `${liRect.width}px`);
    pillRef.current.style.setProperty('--pill-height', `${liRect.height}px`);
  };

  const triggerAnimation = (liEl) => {
    updatePillPosition(liEl);
    if (containerRef.current) {
      makeParticles(containerRef.current, liEl);
    }
  };

  // Handle external controlledIndex change
  useEffect(() => {
    if (controlledIndex === prevIndexRef.current) return;
    prevIndexRef.current = controlledIndex;

    const liEl = navRef.current?.querySelectorAll('li')[controlledIndex];
    if (liEl) {
      setActiveIndex(controlledIndex);
      triggerAnimation(liEl);
    }
  }, [controlledIndex]);

  // Initial position + resize sync
  useEffect(() => {
    if (!navRef.current || !containerRef.current) return;
    const activeLi = navRef.current.querySelectorAll('li')[activeIndex];
    if (activeLi) {
      updatePillPosition(activeLi);
    }

    const resizeObserver = new ResizeObserver(() => {
      const currentActiveLi = navRef.current?.querySelectorAll('li')[activeIndex];
      if (currentActiveLi) {
        updatePillPosition(currentActiveLi);
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, [activeIndex]);

  const handleClick = (liEl, index) => {
    if (activeIndex === index) return;
    setActiveIndex(index);
    triggerAnimation(liEl);
  };

  return (
    <div className="gooey-nav-container" ref={containerRef}>
      <span className="nav-pill" ref={pillRef} />
      <nav>
        <ul ref={navRef}>
          {items.map((item, index) => (
            <li
              key={index}
              className={activeIndex === index ? 'active' : ''}
              onClick={e => {
                const liEl = e.currentTarget;
                handleClick(liEl, index);
                if (item.onClick) item.onClick();
              }}
            >
              <a
                href={item.href}
                onClick={e => e.preventDefault()}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const liEl = e.currentTarget.parentElement;
                    handleClick(liEl, index);
                    if (item.onClick) item.onClick();
                  }
                }}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default GooeyNav;
