import "./ModeToggle.css";

export default function ModeToggle({ mode, onChange }) {
  const isMemories = mode === "memories";

  const handleToggle = () => {
    onChange(isMemories ? "art" : "memories");
  };

  return (
    <button
      type="button"
      className={`mode-icon-btn${isMemories ? " is-memories" : ""}`}
      onClick={handleToggle}
      title={isMemories ? "Chuyển về Work" : "Khám phá Memories"}
      aria-label={isMemories ? "Switch to Work" : "Switch to Memories"}
    >
      <span className="mode-icon-track">
        {/* Icon khi ở chế độ Work: Sparkles/Memories icon gợi ý sang Memories */}
        <span className="mode-icon-item mode-icon--sparkles">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Sparkle / Star icon đại diện cho Memories */}
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            <path d="M5 3v4" />
            <path d="M19 17v4" />
            <path d="M3 5h4" />
            <path d="M17 19h4" />
          </svg>
        </span>

        {/* Icon khi ở chế độ Memories: Grid/Layout icon gợi ý về Work */}
        <span className="mode-icon-item mode-icon--work">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="7" height="7" x="3" y="3" rx="1.5" />
            <rect width="7" height="7" x="14" y="3" rx="1.5" />
            <rect width="7" height="7" x="14" y="14" rx="1.5" />
            <rect width="7" height="7" x="3" y="14" rx="1.5" />
          </svg>
        </span>
      </span>
    </button>
  );
}
