import React from 'react';
import './SimpleMobileNav.css';

export default function SimpleMobileNav({
  items = [],
  activeIndex = 0,
  onChange,
}) {
  return (
    <nav className="simple-mobile-nav" aria-label="Mobile Navigation">
      <ul className="simple-mobile-nav__list">
        {items.map((item, index) => {
          const isActive = index === activeIndex;
          const handleClick = (e) => {
            if (!item.href || item.href === '#') {
              e.preventDefault();
            }
            onChange?.(index, item);
            item.onClick?.();
          };

          return (
            <li
              key={index}
              className={`simple-mobile-nav__item${isActive ? ' is-active' : ''}`}
            >
              {item.href ? (
                <a
                  href={item.href}
                  className="simple-mobile-nav__link"
                  onClick={handleClick}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </a>
              ) : (
                <button
                  type="button"
                  className="simple-mobile-nav__link"
                  onClick={handleClick}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
