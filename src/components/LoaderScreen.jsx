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
      setStatusText('Sẵn sàng');
      const fadeMs = mobile ? 250 : 450;
      setTimeout(() => {
        if (!isMounted) return;
        setIsFadingOut(true);
        setTimeout(() => {
          if (isMounted) onCompleteRef.current?.();
        }, fadeMs);
      }, 150);
    };

    // Danh sách ảnh dịch vụ trọng tâm
    const serviceImages = [
      'https://res.cloudinary.com/g55oyjhn/image/upload/v1790935995/DSC00990.avif',
      'https://res.cloudinary.com/g55oyjhn/image/upload/v1788545041/Still_2026-09-05_010136_1.3.1.jpg',
      'https://res.cloudinary.com/g55oyjhn/image/upload/v1786775685/Tiktok.webp',
      'https://res.cloudinary.com/g55oyjhn/image/upload/v1790936046/DSC01094.avif',
    ];

    // Ảnh bìa tất cả album
    const albumCoverUrls = categories
      .map((cat) => cat.cover || cat.items?.[0]?.image)
      .filter(Boolean);

    // Ảnh hiển thị ban đầu tại màn hình Home
    // Mobile: Các ảnh thẻ kéo thả đầu tiên của chế độ Art
    // Desktop: Ảnh của album Art đầu tiên hiển thị trên DriftWall (cả URL gốc và biến thể kích thước buildSrc)
    let homeInitialImages = [];
    if (mobile) {
      homeInitialImages = categories
        .filter((c) => c.mode === 'art')
        .flatMap((c) => (c.items || []).slice(0, 5).map((i) => i.image))
        .filter(Boolean)
        .slice(0, 15);
    } else {
      const firstArtCategory = categories.find((c) => c.mode === 'art');
      const initialItems = firstArtCategory?.items?.slice(0, 10) || [];
      const rawUrls = initialItems.map((i) => i.image).filter(Boolean);
      const transformedUrls = rawUrls.map((url) => buildSrc(url, { w: 288 }));
      homeInitialImages = [...rawUrls, ...transformedUrls];
    }

    // Tập hợp toàn bộ danh sách ảnh cần tải trước
    const urlsToPreload = Array.from(
      new Set([...albumCoverUrls, ...homeInitialImages, ...serviceImages])
    );
    const total = Math.max(urlsToPreload.length, 1);
    let loaded = 0;

    setStatusText('Đang nạp dữ liệu ảnh...');

    const bump = () => {
      if (!isMounted || finished) return;
      loaded += 1;
      const pct = Math.min(Math.round((loaded / total) * 100), 100);
      setProgress(pct);
      setStatusText(
        pct < 40
          ? 'Đang nạp ảnh...'
          : pct < 90
          ? 'Đang chuẩn bị giao diện...'
          : pct < 100
          ? 'Hoàn tất dữ liệu...'
          : 'Sẵn sàng!'
      );
      if (loaded >= total) {
        // Đã nạp đủ 100% ảnh cần hiển thị
        finish();
      }
    };

    if (urlsToPreload.length === 0) {
      finish();
    } else {
      urlsToPreload.forEach((url) => {
        preloadImage(url).then(bump);
      });
    }

    // Thời gian tối đa cho mạng yếu / chập chờn để không treo vô hạn
    const failSafe = setTimeout(finish, 8000);

    return () => {
      isMounted = false;
      clearTimeout(failSafe);
    };
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
