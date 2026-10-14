import "./ModeToggle.css";

export default function ModeToggle({ mode, onChange }) {
  return (
    <div className="mode-btn-group">
      <button
        type="button"
        className={`mode-btn${mode === "art" ? " mode-btn--active" : ""}`}
        onClick={() => onChange("art")}
        aria-pressed={mode === "art"}
      >
        WORK
      </button>
      <button
        type="button"
        className={`mode-btn${mode === "memories" ? " mode-btn--active" : ""}`}
        onClick={() => onChange("memories")}
        aria-pressed={mode === "memories"}
      >
        MEMORIES
      </button>
    </div>
  );
}
