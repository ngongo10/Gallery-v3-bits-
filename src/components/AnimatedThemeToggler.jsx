import { useRef } from 'react';
import './AnimatedThemeToggler.css';

/**
 * AnimatedThemeToggler — Magic UI circular ripple theme toggler
 * Props:
 *   theme: 'light' | 'dark'
 *   onToggle: (newTheme: string) => void
 */
export default function AnimatedThemeToggler({ theme = 'light', onToggle }) {
  const isDark = theme === 'dark';
  const buttonRef = useRef(null);

  const handleClick = (e) => {
    const nextTheme = isDark ? 'light' : 'dark';

    // Fallback if browser doesn't support View Transitions API
    if (!document.startViewTransition) {
      onToggle?.(nextTheme);
      return;
    }

    const button = buttonRef.current || e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
      onToggle?.(nextTheme);
    });

    transition.ready.then(() => {
      // Circular ripple / bung tỏa hiệu ứng sóng nước
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${maxRadius}px at ${x}px ${y}px)`
          ]
        },
        {
          duration: 500,
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-new(root)'
        }
      );
    });
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      className={`att-btn${isDark ? ' att-btn--dark' : ''}`}
      onClick={handleClick}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="att-track">
        <span className="att-icon att-icon--sun">
          {/* Sun */}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4.5" />
            <line x1="12" y1="2" x2="12" y2="4.5" />
            <line x1="12" y1="19.5" x2="12" y2="22" />
            <line x1="4.22" y1="4.22" x2="6" y2="6" />
            <line x1="18" y1="18" x2="19.78" y2="19.78" />
            <line x1="2" y1="12" x2="4.5" y2="12" />
            <line x1="19.5" y1="12" x2="22" y2="12" />
            <line x1="4.22" y1="19.78" x2="6" y2="18" />
            <line x1="18" y1="6" x2="19.78" y2="4.22" />
          </svg>
        </span>
        <span className="att-icon att-icon--moon">
          {/* Moon */}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </span>
      </span>
    </button>
  );
}
