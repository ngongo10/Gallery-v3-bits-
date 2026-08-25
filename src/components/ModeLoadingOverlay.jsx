import { useEffect, useRef, useState } from "react";
import "./ModeLoadingOverlay.css";

export default function ModeLoadingOverlay({ active, targetMode, onDone }) {
  const [phase, setPhase] = useState("idle"); // idle | flash | fade
  const timerRef = useRef(null);

  useEffect(() => {
    if (!active) { setPhase("idle"); return; }

    setPhase("flash");
    timerRef.current = setTimeout(() => {
      setPhase("fade");
      timerRef.current = setTimeout(() => {
        setPhase("idle");
        if (onDone) onDone();
      }, 400);
    }, 420);

    return () => clearTimeout(timerRef.current);
  }, [active, onDone]);

  if (phase === "idle") return null;

  const isMemories = targetMode === "memories";

  return (
    <div
      className={`mlo mlo--${targetMode} mlo--${phase}`}
      aria-hidden="true"
    >
      <span className="mlo__label">
        {isMemories ? "MEMORIES" : "WORK"}
      </span>
    </div>
  );
}
