import "./ModeToggle.css";

export default function ModeToggle({ mode, onChange }) {
  return (
    <div className={`mode-toggle mode-toggle--${mode}`} role="group" aria-label="Switch mode">
      <button
        className={`mode-toggle__option${mode === "art" ? " is-active" : ""}`}
        onClick={() => mode !== "art" && onChange("art")}
        aria-pressed={mode === "art"}
      >
        WORK
      </button>
      <div className="mode-toggle__pill" aria-hidden="true" />
      <button
        className={`mode-toggle__option${mode === "memories" ? " is-active" : ""}`}
        onClick={() => mode !== "memories" && onChange("memories")}
        aria-pressed={mode === "memories"}
      >
        MEMORIES
      </button>
    </div>
  );
}
