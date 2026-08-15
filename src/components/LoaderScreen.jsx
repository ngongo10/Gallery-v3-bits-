import { useState, useEffect, useRef } from 'react';
import Strands from '../components/Strands';
import GradientText from '../components/GradientText';
import { categories } from '../data/portfolio';
import { buildSrc } from '../utils/cloudinary';
import './LoaderScreen.css';

const PRELOAD_WIDTH = 320;
const MAX_WAIT_MS = 5000;

function isMobileDevice() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(max-width: 768px)').matches ||
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  );
}

function preloadImage(url) {
  return new Promise((resolve) => {
    if (!url) {
      resolve();
      return;
    }
    const img = new Image();
    const done = () => resolve();
    img.onload = done;
    img.onerror = done;
    img.src = url;
  });
}

export default function LoaderScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing...');
  const [isFadingOut, setIsFadingOut] = useState(false);
  const onCompleteRef = useRef(onComplete);
  const [showStrands] = useState(() => !isMobileDevice());

  onCompleteRef.current = onComplete;

  useEffect(() => {
    let isMounted = true;
    let finished = false;
    const mobile = isMobileDevice();

    const finish = () => {
      if (!isMounted || finished) return;
      finished = true;
      setProgress(100);
      setStatusText('Ready');
      // Short fade — don't stack long timeouts on weak devices
      const fadeMs = mobile ? 200 : 400;
      setTimeout(() => {
        if (!isMounted) return;
        setIsFadingOut(true);
        setTimeout(() => {
          if (isMounted) onCompleteRef.current?.();
        }, fadeMs);
      }, mobile ? 80 : 160);
    };

    // Mobile: skip network preload — mounting Home is enough work.
    if (mobile) {
      setStatusText('Preparing...');
      let p = 0;
      const tick = setInterval(() => {
        if (!isMounted) return;
        p = Math.min(p + 18, 92);
        setProgress(p);
      }, 60);
      const done = setTimeout(() => {
        clearInterval(tick);
        finish();
      }, 700);
      const failSafe = setTimeout(finish, MAX_WAIT_MS);
      return () => {
        isMounted = false;
        clearInterval(tick);
        clearTimeout(done);
        clearTimeout(failSafe);
      };
    }

    const urls = categories
      .map((cat) => buildSrc(cat.cover || cat.items?.[0]?.image, { w: PRELOAD_WIDTH }))
      .filter(Boolean)
      .slice(0, 6);

    const total = Math.max(urls.length, 1);
    let loaded = 0;

    const bump = () => {
      if (!isMounted || finished) return;
      loaded += 1;
      const pct = Math.min(Math.round((loaded / total) * 100), 99);
      setProgress(pct);
      setStatusText(pct < 50 ? 'Loading covers...' : 'Preparing home...');
      if (loaded >= total) finish();
    };

    if (urls.length === 0) {
      finish();
    } else {
      urls.forEach((url) => {
        preloadImage(url).then(bump);
      });
    }

    const failSafe = setTimeout(finish, MAX_WAIT_MS);

    return () => {
      isMounted = false;
      clearTimeout(failSafe);
    };
    // Intentionally empty — onComplete via ref to avoid remount loops
  }, []);

  return (
    <div className={`loader-screen ${isFadingOut ? 'is-fading-out' : ''}`}>
      <div className="loader-strands">
        {showStrands && (
          <Strands
            colors={['#25dfff', '#ff004a', '#7C3AED', '#06B6D4']}
            count={3}
            speed={0.6}
            amplitude={1.2}
            waviness={1.2}
            thickness={0.8}
            glow={2.2}
            scale={1.4}
          />
        )}
      </div>

      <div className="loader-content">
        <div className="loader-brand">
          <GradientText
            colors={['#25dfff', '#ff004a', '#a855f7', '#25dfff']}
            animationSpeed={5}
            showBorder={false}
          >
            <h1 className="loader-title">JUBISATAKA</h1>
          </GradientText>
        </div>

        <p className="loader-subtitle">Visual Artist Portfolio</p>

        <div className="loader-progress-wrap">
          <div className="loader-progress-bar" style={{ width: `${progress}%` }} />
        </div>

        <div className="loader-info">
          <span className="loader-status">{statusText}</span>
          <span className="loader-pct">{progress}%</span>
        </div>
      </div>
    </div>
  );
}
