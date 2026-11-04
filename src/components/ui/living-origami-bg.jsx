import React from 'react';

// Living Origami Background effect
// Procedurally generates flying, glowing 3D origami cranes drifting across a gradient atmosphere.

export function LivingOrigamiBg({ className = "" }) {
  const random = (min, max) => Math.random() * (max - min) + min;

  // 15 drifting origami cranes with procedural variations
  const drifters = React.useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      id: i,
      duration: random(20, 40),
      delay: random(-40, 0),
      scale: random(0.3, 0.85),
      yStart: `${random(-35, 35)}vh`,
      yEnd: `${random(-35, 35)}vh`,
      rStart: `${random(-30, 30)}deg`,
      rEnd: `${random(-30, 30)}deg`,
      flapDelay: `${random(-4, 0)}s`,
    }));
  }, []);

  return (
    <div className={`hero-section absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden ${className}`}>
      {drifters.map((d) => (
        <div
          key={d.id}
          className="drifter-container"
          style={{
            '--y-start': d.yStart,
            '--y-end': d.yEnd,
            '--r-start': d.rStart,
            '--r-end': d.rEnd,
            animationDuration: `${d.duration}s`,
            animationDelay: `${d.delay}s`,
          } }
        >
          <div
            className="origami-crane"
            style={{
              transform: `scale(${d.scale})`,
              animationDelay: d.flapDelay,
            }}
          >
            <div className="crane-part body" />
            <div className="crane-part wing-left" />
            <div className="crane-part wing-right" />
            <div className="crane-part tail" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default LivingOrigamiBg;
