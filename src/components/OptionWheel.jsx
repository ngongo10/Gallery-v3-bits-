import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import './OptionWheel.css';

const DEFAULT_ITEMS = [
  'Photography',
  'Video',
  'Motion',
  'Portrait',
  'Landscape',
  'Architecture',
  'Abstract',
  'Street',
];

const DIAL_TICKS = [
  { d: -2.0,  type: 'major', len: 14, opacity: 0.45 },
  { d: -1.66, type: 'minor', len: 7,  opacity: 0.32 },
  { d: -1.33, type: 'minor', len: 7,  opacity: 0.42 },
  { d: -1.0,  type: 'major', len: 15, opacity: 0.70 },
  { d: -0.66, type: 'minor', len: 8,  opacity: 0.52 },
  { d: -0.33, type: 'minor', len: 8,  opacity: 0.60 },
  { d: 0,     type: 'active', len: 24, opacity: 1.0 },
  { d: 0.33,  type: 'minor', len: 8,  opacity: 0.60 },
  { d: 0.66,  type: 'minor', len: 8,  opacity: 0.52 },
  { d: 1.0,   type: 'major', len: 15, opacity: 0.70 },
  { d: 1.33,  type: 'minor', len: 7,  opacity: 0.42 },
  { d: 1.66,  type: 'minor', len: 7,  opacity: 0.32 },
  { d: 2.0,   type: 'major', len: 14, opacity: 0.45 },
];

const OptionWheel = ({
  items = DEFAULT_ITEMS,
  defaultSelected = 0,
  onChange,
  onItemClick,
  textColor,
  activeColor,
  side = 'left',
  fontSize = 3,
  spacing = 1.4,
  curve = 1,
  tilt = 6,
  blur = 2,
  fade = 0.25,
  minOpacity = 0.05,
  smoothing = 200,
  inset = 80,
  loop = false,
  draggable = true,
  exiting = false,
  soundUrl = '',
  soundVolume = 0.5,
  className = '',
  orientation = 'vertical', // 'vertical' (desktop side) | 'horizontal' (mobile bottom watch dial)
  hideLabels = false
}) => {
  const rootRef = useRef(null);
  const itemRefs = useRef([]);
  const posRef = useRef(defaultSelected);
  const targetRef = useRef(defaultSelected);
  const rafRef = useRef(null);
  const lastRef = useRef(0);
  const cfgRef = useRef({});
  const onChangeRef = useRef(onChange);
  const onItemClickRef = useRef(onItemClick);
  const selectedRef = useRef(defaultSelected);
  const wheelTimerRef = useRef(null);
  const dragRef = useRef(null);
  const dragMovedRef = useRef(false);
  const dragHistoryRef = useRef([]);
  const audioRef = useRef(null);
  const audioUrlRef = useRef('');
  const lastTickRef = useRef(0);
  const [selectedIndex, setSelectedIndex] = useState(defaultSelected);
  const [isDragging, setIsDragging] = useState(false);

  const remPx = typeof window !== 'undefined' ? parseFloat(getComputedStyle(document.documentElement).fontSize) || 16 : 16;

  onChangeRef.current = onChange;
  onItemClickRef.current = onItemClick;
  cfgRef.current = {
    count: items.length,
    items,
    rowH: Math.max(fontSize * spacing * remPx, 1),
    curve,
    tilt,
    blur,
    fade,
    minOpacity,
    side,
    loop,
    smoothing,
    draggable,
    soundUrl,
    soundVolume,
    orientation,
    hideLabels
  };

  const isHorizontal = orientation === 'horizontal';

  // In horizontal mode: center of invisible circle is placed below the bottom
  // Radius R = 320px. Angular step between items = 14 degrees
  const HORIZ_RADIUS = 320;
  const DEG_PER_INDEX = 14;

  const dialTicksWithStyle = useMemo(() => {
    if (isHorizontal) {
      // Build a full set of watch ticks along the circumference around bottom center
      // Total span covers all categories + overflow
      const totalSteps = items.length;
      const ticks = [];
      // Generate ticks spanning across all categories
      const minD = -3;
      const maxD = totalSteps + 2;
      const step = 0.25; // 4 ticks per index (1 major item tick + 3 minor subdivision ticks)

      for (let d = minD; d <= maxD; d += step) {
        const isMajor = Math.abs(d - Math.round(d)) < 0.01;
        const tickType = isMajor ? 'major' : 'minor';
        const len = isMajor ? 16 : 8;
        const deg = d * DEG_PER_INDEX;
        const rad = (deg * Math.PI) / 180;
        // Position on circle perimeter relative to center: (R * sin(rad), -R * cos(rad))
        const x = HORIZ_RADIUS * Math.sin(rad);
        const y = -HORIZ_RADIUS * Math.cos(rad);
        ticks.push({
          d,
          type: tickType,
          len,
          x,
          y,
          rot: deg, // radial angle pointing toward center
          opacity: isMajor ? 0.85 : 0.4
        });
      }
      return ticks;
    }

    const rowH = Math.max(fontSize * spacing * remPx, 1);
    const tiltRad = (tilt * Math.PI) / 180;
    const R = tiltRad > 0.0005 ? rowH / tiltRad : 0;
    const mirror = side === 'right' ? -1 : 1;

    return DIAL_TICKS.map(tick => {
      let x = 0;
      let y = tick.d * rowH;
      let rot = 0;
      if (R > 0) {
        const ang = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, tick.d * tiltRad));
        y = R * Math.sin(ang);
        x = -mirror * R * (1 - Math.cos(ang)) * curve;
        rot = (mirror * ang * 180) / Math.PI;
      }
      return {
        ...tick,
        x,
        y,
        rot
      };
    });
  }, [fontSize, spacing, remPx, tilt, side, curve, isHorizontal, items.length]);

  const runFrame = useCallback(now => {
    const dt = Math.min((now - lastRef.current) / 1000, 0.05);
    lastRef.current = now;
    const cfg = cfgRef.current;
    const tau = Math.max(cfg.smoothing, 1) / 1000;
    const k = 1 - Math.exp(-dt / tau);

    const target = targetRef.current;
    const cur = posRef.current;
    let next = cur + (target - cur) * k;
    const settled = Math.abs(target - next) < 0.001;
    if (settled) next = target;
    posRef.current = next;

    // In horizontal mode: rotate the whole dial scale around invisible circle center
    if (cfg.orientation === 'horizontal') {
      const dialEl = rootRef.current?.querySelector('.option-wheel__dial-scale');
      if (dialEl) {
        const rotDeg = -next * DEG_PER_INDEX;
        dialEl.style.transform = `rotate(${rotDeg.toFixed(3)}deg)`;
      }
    }

    if (!cfg.hideLabels) {
      const els = itemRefs.current;
      const n = cfg.count;
      const mirror = cfg.side === 'right' ? -1 : 1;
      const tiltRad = (cfg.tilt * Math.PI) / 180;
      const R = tiltRad > 0.0005 ? cfg.rowH / tiltRad : 0;
      for (let i = 0; i < n; i++) {
        const el = els[i];
        if (!el) continue;
        let d = i - next;
        if (cfg.loop && n > 1) {
          d = ((d % n) + n) % n;
          if (d > n / 2) d -= n;
        }
        const dist = Math.abs(d);
        let x = 0;
        let y = d * cfg.rowH;
        let rot = 0;
        if (R > 0) {
          const ang = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, d * tiltRad));
          y = R * Math.sin(ang);
          x = -mirror * R * (1 - Math.cos(ang)) * cfg.curve;
          rot = (mirror * ang * 180) / Math.PI;
        }
        el.style.transform = `translate(${x.toFixed(2)}px, calc(${y.toFixed(2)}px - 50%)) rotate(${rot.toFixed(3)}deg)`;
        el.style.opacity = String(Math.max(cfg.minOpacity, 1 - dist * cfg.fade));
        el.style.filter = cfg.blur > 0 ? `blur(${(dist * cfg.blur).toFixed(2)}px)` : 'none';
        el.style.setProperty('--ow-p', Math.max(0, 1 - Math.min(dist, 1)).toFixed(4));
      }
    }

    rafRef.current = settled ? null : requestAnimationFrame(runFrame);
  }, []);

  const startLoop = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
    }
    lastRef.current = performance.now();
    rafRef.current = requestAnimationFrame(runFrame);
  }, [runFrame]);

  const playTick = useCallback(() => {
    const { soundUrl, soundVolume } = cfgRef.current;
    if (!soundUrl) return;
    const now = performance.now();
    if (now - lastTickRef.current < 70) return;
    lastTickRef.current = now;
    if (!audioRef.current || audioUrlRef.current !== soundUrl) {
      audioRef.current = new Audio(soundUrl);
      audioRef.current.preload = 'auto';
      audioUrlRef.current = soundUrl;
    }
    const audio = audioRef.current;
    audio.volume = Math.min(Math.max(soundVolume, 0), 1);
    audio.currentTime = 0;
    audio.play()?.catch(() => {});
  }, []);

  const applyTarget = useCallback(
    (value, snap) => {
      const cfg = cfgRef.current;
      let v = value;
      if (!cfg.loop) v = Math.min(Math.max(v, 0), Math.max(cfg.count - 1, 0));
      if (snap) v = Math.round(v);
      targetRef.current = v;
      const idx = ((Math.round(v) % cfg.count) + cfg.count) % cfg.count;
      if (idx !== selectedRef.current) {
        selectedRef.current = idx;
        setSelectedIndex(idx);
        onChangeRef.current?.(idx, cfg.items[idx]);
        playTick();
      }
      startLoop();
    },
    [startLoop, playTick]
  );

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onWheel = e => {
      e.preventDefault();
      const cfg = cfgRef.current;
      const rawDelta = e.deltaMode === 1 ? e.deltaY * 40 : e.deltaY;
      // Proportional step — follows scroll speed naturally
      const step = rawDelta / (cfg.rowH * 1.8);
      // Clamp to prevent wild jumps from trackpad flicks
      const clampedStep = Math.max(-2.5, Math.min(2.5, step));
      applyTarget(targetRef.current + clampedStep, false);
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
      wheelTimerRef.current = setTimeout(() => applyTarget(targetRef.current, true), 200);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
    };
  }, [applyTarget]);

  const handlePointerDown = useCallback(e => {
    if (!cfgRef.current.draggable) return;
    const now = performance.now();
    const isHoriz = cfgRef.current.orientation === 'horizontal';
    dragRef.current = {
      x: e.clientX,
      y: e.clientY,
      start: posRef.current,
      id: e.pointerId
    };
    dragHistoryRef.current = [{ val: isHoriz ? e.clientX : e.clientY, t: now }];
    dragMovedRef.current = false;
    setIsDragging(true);
  }, []);

  const handlePointerMove = useCallback(
    e => {
      const drag = dragRef.current;
      if (!drag) return;
      const isHoriz = cfgRef.current.orientation === 'horizontal';
      const delta = isHoriz ? -(e.clientX - drag.x) : -(e.clientY - drag.y);
      const now = performance.now();
      if (!dragMovedRef.current && Math.abs(delta) > 4) {
        dragMovedRef.current = true;
        rootRef.current?.setPointerCapture(drag.id);
      }
      if (dragMovedRef.current) {
        const history = dragHistoryRef.current;
        history.push({ val: isHoriz ? e.clientX : e.clientY, t: now });
        if (history.length > 5) history.shift();

        // Step sensitivity: in horizontal watch dial, 70px drag moves 1 index
        const stepPx = isHoriz ? 70 : cfgRef.current.rowH;
        const newPos = drag.start + delta / stepPx;
        posRef.current = newPos;
        targetRef.current = newPos;

        const cfg = cfgRef.current;
        const idx = ((Math.round(newPos) % cfg.count) + cfg.count) % cfg.count;
        if (idx !== selectedRef.current) {
          selectedRef.current = idx;
          setSelectedIndex(idx);
          onChangeRef.current?.(idx, cfg.items[idx]);
          playTick();
        }
        startLoop();
      }
    },
    [startLoop, playTick]
  );

  const handlePointerEnd = useCallback(() => {
    if (!dragRef.current) return;
    const isHoriz = cfgRef.current.orientation === 'horizontal';
    dragRef.current = null;
    setIsDragging(false);
    if (dragMovedRef.current) {
      const history = dragHistoryRef.current;
      let velocity = 0;
      const stepPx = isHoriz ? 70 : cfgRef.current.rowH;
      if (history.length >= 2) {
        const recent = history[history.length - 1];
        const older = history[Math.max(0, history.length - 3)];
        const dt = (recent.t - older.t) / 1000;
        if (dt > 0.005) {
          velocity = -(recent.val - older.val) / stepPx / dt;
        }
      }
      velocity = Math.max(-25, Math.min(25, velocity));
      const momentumDistance = velocity * 0.12;
      const projected = posRef.current + momentumDistance;
      const snapped = Math.round(projected);
      applyTarget(snapped, true);
    }
  }, [applyTarget]);


  const handleItemClick = useCallback(
    index => {
      if (dragMovedRef.current) return;
      const cfg = cfgRef.current;
      const cur = targetRef.current;
      let d = index - (((cur % cfg.count) + cfg.count) % cfg.count);
      if (cfg.loop && cfg.count > 1) {
        if (d > cfg.count / 2) d -= cfg.count;
        else if (d < -cfg.count / 2) d += cfg.count;
      }
      applyTarget(cur + d, true);

      const open = () => onItemClickRef.current?.(index, cfg.items[index]);

      // Wait until the clicked item is centered before opening — avoids
      // starting the exit spin mid-scroll (especially for bottom items).
      if (Math.abs(d) < 0.01) {
        open();
        return;
      }

      const deadline = performance.now() + 700;
      const waitSettle = () => {
        if (Math.abs(posRef.current - targetRef.current) < 0.04 || performance.now() > deadline) {
          open();
          return;
        }
        requestAnimationFrame(waitSettle);
      };
      requestAnimationFrame(waitSettle);
    },
    [applyTarget]
  );

  const handleKeyDown = useCallback(
    e => {
      let delta = null;
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') delta = -1;
      else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') delta = 1;
      if (delta == null) return;
      e.preventDefault();
      applyTarget(Math.round(targetRef.current) + delta, true);
    },
    [applyTarget]
  );

  useEffect(() => {
    applyTarget(targetRef.current, false);
  }, [items, fontSize, spacing, curve, tilt, blur, fade, minOpacity, side, loop, smoothing, applyTarget]);

  useEffect(() => {
    if (!exiting) {
      rootRef.current?.classList.remove('option-wheel--exiting');
      return;
    }

    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    rootRef.current?.classList.add('option-wheel--exiting');

    const cfg = cfgRef.current;
    const n = Math.max(cfg.count, 1);
    // Snap to settled/selected index so spin always starts from the centered item
    const startPos = Math.round(targetRef.current);
    posRef.current = startPos;
    // One full reel turn — same motion as mouse-wheel scroll
    const endPos = startPos + n;
    const duration = 1100;
    const t0 = performance.now();

    const easeOut = t => 1 - (1 - t) ** 2.6;

    const paint = (pos, fade) => {
      const els = itemRefs.current;
      const mirror = cfg.side === 'right' ? -1 : 1;
      const tiltRad = (cfg.tilt * Math.PI) / 180;
      const R = tiltRad > 0.0005 ? cfg.rowH / tiltRad : 0;

      for (let i = 0; i < n; i++) {
        const el = els[i];
        if (!el) continue;
        // Wrap during exit so the reel spins continuously like a scroll flick
        let d = i - pos;
        d = ((d % n) + n) % n;
        if (d > n / 2) d -= n;
        const dist = Math.abs(d);
        let x = 0;
        let y = d * cfg.rowH;
        let rot = 0;
        if (R > 0) {
          const ang = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, d * tiltRad));
          y = R * Math.sin(ang);
          x = -mirror * R * (1 - Math.cos(ang)) * cfg.curve;
          rot = (mirror * ang * 180) / Math.PI;
        }
        el.style.transform = `translate(${x.toFixed(2)}px, calc(${y.toFixed(2)}px - 50%)) rotate(${rot.toFixed(3)}deg)`;
        const baseOp = Math.max(cfg.minOpacity, 1 - dist * cfg.fade);
        el.style.opacity = String(Math.max(0, baseOp * fade));
        const blurAmt = dist * cfg.blur + (fade < 1 ? (1 - fade) * 8 : 0);
        el.style.filter = blurAmt > 0.05 ? `blur(${blurAmt.toFixed(2)}px)` : 'none';
        el.style.setProperty('--ow-p', Math.max(0, 1 - Math.min(dist, 1)).toFixed(4));
      }
    };

    const tick = now => {
      const t = Math.min(1, (now - t0) / duration);
      const e = easeOut(t);
      const pos = startPos + (endPos - startPos) * e;
      posRef.current = pos;
      // Fade out in the last stretch so the reel doesn't hard-cut
      const fade = t > 0.72 ? 1 - (t - 0.72) / 0.28 : 1;
      paint(pos, fade);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [exiting]);

  useEffect(
    () => () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      audioRef.current?.pause();
    },
    []
  );

  return (
    <div
      ref={rootRef}
      role="listbox"
      tabIndex={0}
      aria-label="Option wheel"
      className={`option-wheel${side === 'right' ? ' option-wheel--right' : ''}${isHorizontal ? ' option-wheel--horizontal' : ''}${isDragging ? ' option-wheel--dragging' : ''}${className ? ` ${className}` : ''}`}
      style={{
        ...(textColor ? { '--ow-text-color': textColor } : {}),
        ...(activeColor ? { '--ow-active-color': activeColor } : {}),
        '--ow-font-size': `${fontSize}rem`,
        '--ow-inset': `${inset}px`
      }}
      onPointerDown={exiting ? undefined : handlePointerDown}
      onPointerMove={exiting ? undefined : handlePointerMove}
      onPointerUp={exiting ? undefined : handlePointerEnd}
      onPointerCancel={exiting ? undefined : handlePointerEnd}
      onKeyDown={exiting ? undefined : handleKeyDown}
    >
      {isHorizontal && (
        <div className="option-wheel__center-needle" aria-hidden="true">
          <span className="option-wheel__center-dot" />
          <span className="option-wheel__center-line" />
        </div>
      )}
      <div className="option-wheel__dial-scale" aria-hidden="true">
        {dialTicksWithStyle.map(tick => {
          if (tick.type === 'active') {
            return (
              <div
                key={`dial-tick-${tick.d}`}
                className="option-wheel__dial-tick option-wheel__dial-tick--active"
                style={{
                  transform: isHorizontal
                    ? `translate(${tick.x.toFixed(2)}px, ${tick.y.toFixed(2)}px) rotate(${tick.rot.toFixed(3)}deg)`
                    : `translate(${tick.x.toFixed(2)}px, calc(${tick.y.toFixed(2)}px - 50%)) rotate(${tick.rot.toFixed(3)}deg)`,
                  opacity: tick.opacity
                }}
              >
                <span className="option-wheel__dial-dot" />
                <span className="option-wheel__dial-line" style={{ width: `${tick.len}px` }} />
              </div>
            );
          }
          return (
            <div
              key={`dial-tick-${tick.d}`}
              className={`option-wheel__dial-tick option-wheel__dial-tick--${tick.type}`}
              style={{
                transform: isHorizontal
                  ? `translate(${tick.x.toFixed(2)}px, ${tick.y.toFixed(2)}px) rotate(${tick.rot.toFixed(3)}deg)`
                  : `translate(${tick.x.toFixed(2)}px, calc(${tick.y.toFixed(2)}px - 50%)) rotate(${tick.rot.toFixed(3)}deg)`,
                opacity: tick.opacity
              }}
            >
              <span className="option-wheel__dial-line" style={{ width: `${tick.len}px` }} />
            </div>
          );
        })}
      </div>
      {!hideLabels && items.map((label, index) => (
        <div
          key={`${label}-${index}`}
          ref={el => {
            itemRefs.current[index] = el;
          }}
          role="option"
          aria-selected={selectedIndex === index}
          className={`option-wheel__item${selectedIndex === index ? ' option-wheel__item--selected' : ''}`}
          onClick={() => handleItemClick(index)}
        >
          {label}
        </div>
      ))}
    </div>
  );
};

export default OptionWheel;
