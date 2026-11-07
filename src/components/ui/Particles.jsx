'use client';

import { useEffect, useRef } from 'react';

// Canvas 2D Particles - Sieu nhe, khong lo loi shader / WebGL2 tren mobile va trinh duyet
export const Particles = ({
  particleCount = 290,
  particleColors = ['#ffffff', '#eefffb', '#ffffff'],
  speed = 0.1,
  particleBaseSize = 90,
  glow = 0.65,
  twinkle = 0.3,
  depthOfField = 0.15,
  lightMode = false,
  className = '',
  style,
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let width = (canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1));
    let height = (canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1));

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1);
      height = canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1);
    };
    window.addEventListener('resize', onResize);

    const colors = Array.isArray(particleColors) && particleColors.length ? particleColors : ['#ffffff'];

    // Khoi tao tap hop hat
    const particles = Array.from({ length: particleCount }, () => {
      const z = Math.random(); // Do sau (0: xa, 1: gan)
      const baseRadius = (particleBaseSize / 25) * (0.4 + z * 0.8);
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        z,
        radius: baseRadius,
        vx: (Math.random() - 0.5) * speed * 4,
        vy: (Math.random() - 0.5) * speed * 4 - speed * 1.5, // hoi troi len nhe
        color: colors[Math.floor(Math.random() * colors.length)],
        twinkleOffset: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.02 + Math.random() * 0.04,
      };
    });

    let time = 0;
    const render = () => {
      time += 1;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around man hinh
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        // Tinh toan twinkle (nhap nhay)
        const currentTwinkle = Math.sin(time * p.twinkleSpeed + p.twinkleOffset);
        const alpha = Math.max(0.1, Math.min(1, (0.5 + 0.5 * currentTwinkle) * (0.3 + 0.7 * p.z)));

        ctx.save();
        ctx.globalAlpha = alpha;

        if (glow > 0 && !lightMode) {
          ctx.shadowBlur = p.radius * (glow * 4 + depthOfField * 10);
          ctx.shadowColor = p.color;
        }

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, [particleCount, particleColors, speed, particleBaseSize, glow, twinkle, depthOfField, lightMode]);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`} style={style}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
    </div>
  );
};

export default Particles;
