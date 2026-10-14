import "./ModeToggle.css";

export default function ModeToggle({ mode, onChange }) {
  const isMemories = mode === "memories";

  const handleToggle = () => {
    onChange(isMemories ? "art" : "memories");
  };

  return (
    <button
      type="button"
      className={`single-mode-btn${isMemories ? " is-memories" : ""}`}
      onClick={handleToggle}
      title={isMemories ? "Quay lại Work" : "Khám phá Memories"}
      aria-label="Toggle Memories"
    >
      <span className="single-mode-dot" />
      <span className="single-mode-text">
        {isMemories ? "WORK" : "MEMORIES"}
      </span>
    </button>
  );
}
