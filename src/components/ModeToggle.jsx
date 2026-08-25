import "./ModeToggle.css";

export default function ModeToggle({ mode, onChange }) {
  const isMemories = mode === "memories";

  const handleToggle = () => {
    onChange(isMemories ? "art" : "memories");
  };

  return (
    <div
      className={`mode-switch-only${isMemories ? " is-on" : ""}`}
      onClick={handleToggle}
      role="switch"
      aria-checked={isMemories}
      title={isMemories ? "Switch to Work" : "Switch to Memories"}
    >
      <div className="mode-switch-thumb" />
    </div>
  );
}
