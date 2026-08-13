import { useState, useEffect } from 'react';
import Strands from '../components/Strands';
import GradientText from '../components/GradientText';
import { allItems } from '../data/portfolio';
import './LoaderScreen.css';

export default function LoaderScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing assets...');
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const totalItems = allItems.length;
    let loadedCount = 0;

    if (totalItems === 0) {
      setProgress(100);
      setTimeout(() => onComplete(), 500);
      return;
    }

    const updateProgress = () => {
      if (!isMounted) return;
      loadedCount++;
      const currentPct = Math.min(Math.round((loadedCount / totalItems) * 100), 100);
      setProgress(currentPct);

      if (currentPct < 40) {
        setStatusText('Loading gallery assets...');
      } else if (currentPct < 85) {
        setStatusText('Preparing 3D DriftWall & Shader textures...');
      } else {
        setStatusText('Finishing up...');
      }

      if (loadedCount >= totalItems) {
        setTimeout(() => {
          if (isMounted) {
            setIsFadingOut(true);
            setTimeout(() => {
              if (isMounted) onComplete();
            }, 600);
          }
        }, 400);
      }
    };

    // Preload images into memory and decode them synchronously
    const imagePromises = allItems.map(item => {
      return new Promise(resolve => {
        const img = new Image();
        img.src = item.image;
        if (img.complete) {
          updateProgress();
          resolve();
        } else {
          img.onload = () => {
            if (img.decode) {
              img.decode().then(() => {
                updateProgress();
                resolve();
              }).catch(() => {
                updateProgress();
                resolve();
              });
            } else {
              updateProgress();
              resolve();
            }
          };
          img.onerror = () => {
            updateProgress();
            resolve();
          };
        }
      });
    });

    Promise.all(imagePromises).then(() => {
      if (isMounted) {
        setProgress(100);
        setStatusText('Ready');
        setTimeout(() => {
          if (isMounted) {
            setIsFadingOut(true);
            setTimeout(() => {
              if (isMounted) onComplete();
            }, 500);
          }
        }, 300);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [onComplete]);

  return (
    <div className={`loader-screen ${isFadingOut ? 'is-fading-out' : ''}`}>
      {/* Background WebGL Strands */}
      <div className="loader-strands">
        <Strands
          colors={['#25dfff', '#ff004a', '#7C3AED', '#06B6D4']}
          count={4}
          speed={0.6}
          amplitude={1.2}
          waviness={1.2}
          thickness={0.8}
          glow={2.8}
          scale={1.4}
        />
      </div>

      {/* Center Content */}
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

        {/* Progress Bar Container */}
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
