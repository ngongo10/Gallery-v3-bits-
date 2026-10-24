import { useRef, useState } from "react";
import "./ModeToggle.css";

/**
 * GhostGlitchDust (ModeToggle) — Easter Egg chuyển Mode Memories
 * Tái hiện ý tưởng hạt bụi ký ức bí ẩn trôi nổi:
 * - Bình thường: như một hạt bụi/ánh sáng siêu nhỏ (ambient particle) lơ lửng, ẩn hiện mờ ảo.
 * - Khi hover: hạt bụi thức tỉnh, tích tụ năng lượng với hiệu ứng glint lấp lánh (sparkles) và âm hưởng game.
 * - Khi click: nổ bung hạt ánh sáng (dust burst) và mở rộng View Transition dạng sóng tròn bung tỏa toàn màn hình (circular game ripple).
 */
export default function ModeToggle({ mode, onChange }) {
  const isMemories = mode === "memories";
  const buttonRef = useRef(null);
  const [bursting, setBursting] = useState(false);

  const handleClick = (e) => {
    e.stopPropagation();
    const nextMode = isMemories ? "art" : "memories";

    // Kích hoạt animation hạt nổ
    setBursting(true);
    setTimeout(() => setBursting(false), 800);

    // Kiểm tra View Transition API
    if (!document.startViewTransition) {
      onChange(nextMode);
      return;
    }

    const rect = buttonRef.current?.getBoundingClientRect() || e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
      onChange(nextMode);
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${maxRadius * 1.05}px at ${x}px ${y}px)`
          ],
          filter: [
            "blur(14px) brightness(1.6) contrast(1.2)",
            "blur(0px) brightness(1) contrast(1)"
          ]
        },
        {
          duration: 700,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          pseudoElement: "::view-transition-new(root)"
        }
      );
    });
  };

  return (
    <div className={`ghost-dust-container${isMemories ? " is-memories" : ""}`}>
      <button
        ref={buttonRef}
        type="button"
        className={`ghost-dust-trigger${bursting ? " is-bursting" : ""}`}
        onClick={handleClick}
        title={isMemories ? "Trở về hiện tại" : "???"}
        aria-label={isMemories ? "Return to Art" : "Mystery Memories"}
      >
        {/* Vòng aura ánh sáng mờ ảo */}
        <span className="dust-ambient-aura" aria-hidden="true" />

        {/* Hạt nhân bụi sáng chính */}
        <span className="dust-core">
          <span className="dust-core-inner" />
        </span>

        {/* Các mảnh tinh thể hạt bụi bay xung quanh */}
        <span className="dust-orbit dust-orbit-1" />
        <span className="dust-orbit dust-orbit-2" />
        <span className="dust-orbit dust-orbit-3" />

        {/* Biểu tượng gợi ý cực kỳ tinh tế chỉ hé lộ khi hover */}
        <span className="dust-symbol" aria-hidden="true">
          {isMemories ? (
            /* Icon thoát khỏi ký ức */
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          ) : (
            /* Sparkle game icon */
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L14.3 9.7L22 12L14.3 14.3L12 22L9.7 14.3L2 12L9.7 9.7L12 2Z" />
            </svg>
          )}
        </span>

        {/* Tia sáng bung nổ khi click */}
        {bursting && (
          <span className="dust-burst-particles">
            {[...Array(6)].map((_, i) => (
              <span key={i} className={`burst-shard burst-shard-${i}`} />
            ))}
          </span>
        )}
      </button>

      {/* Dòng chữ gợi mở bí ẩn mờ mờ khi hover */}
      <span className="dust-tooltip">
        {isMemories ? "Back to Reality" : "Memories"}
      </span>
    </div>
  );
}
