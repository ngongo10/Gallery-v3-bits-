import { useEffect, useState } from "react";
import "./ModeLoadingOverlay.css";

export default function ModeLoadingOverlay({ active, targetMode, onDone }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState("idle"); // idle | loading | fadeout

  useEffect(() => {
    if (!active) {
      setPhase("idle");
      setProgress(0);
      return;
    }

    setPhase("loading");
    setProgress(0);

    let p = 0;
    const interval = setInterval(() => {
      p += Math.floor(Math.random() * 22) + 12;
      if (p >= 100) {
        p = 100;
        setProgress(100);
        clearInterval(interval);

        // Giữ 100% một thoáng rồi fade out êm ái
        setTimeout(() => {
          setPhase("fadeout");
          setTimeout(() => {
            setPhase("idle");
            if (onDone) onDone();
          }, 350);
        }, 120);
      } else {
        setProgress(p);
      }
    }, 45);

    return () => clearInterval(interval);
  }, [active, onDone]);

  if (phase === "idle") return null;

  return (
    <div className={`legacy-loader-overlay${phase === "fadeout" ? " is-fadeout" : ""}`}>
      <div className="legacy-loader-content">
        <h1 className="legacy-loader-title">JUBI SATAKA</h1>
        <div className="legacy-loader-bar-wrap">
          <div className="legacy-loader-bar" style={{ width: `${progress}%` }} />
        </div>
        <span className="legacy-loader-text">{progress}%</span>
      </div>
    </div>
  );
}
