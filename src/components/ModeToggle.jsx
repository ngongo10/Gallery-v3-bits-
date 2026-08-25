import "./ModeToggle.css";

export default function ModeToggle({ mode, onChange }) {
  const isMemories = mode === "memories";

  const handleToggle = () => {
    onChange(isMemories ? "art" : "memories");
  };

  return (
    <div className="mode-toggle-container" onClick={handleToggle} title="Switch between Work & Memories">
      <span className={`mode-toggle-label${!isMemories ? " is-active" : ""}`}>
        WORK
      </span>
      <div className={`mode-switch${isMemories ? " is-on" : ""}`} role="switch" aria-checked={isMemories}>
        <div className="mode-switch-thumb" />
      </div>
      <span className={`mode-toggle-label${isMemories ? " is-active" : ""}`}>
        MEMORIES
      </span>
    </div>
  );
}
