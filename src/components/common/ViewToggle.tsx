import "./ViewToggle.css"


interface ViewToggleProps {
  onViewChange: (viewId: string) => void; 
  currentView: string; 
  options: string[]; 
}

export default function ViewToggle({ 
  onViewChange, 
  currentView, 
  options 
}: ViewToggleProps) {
  return (
    <div className="viewToggleContainer">
      <div className="viewToggle">
        {options.map((option) => (
          <button
            key={option}
            className={`viewButton ${currentView === option ? "activeView" : ""}`}
            onClick={() => onViewChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}