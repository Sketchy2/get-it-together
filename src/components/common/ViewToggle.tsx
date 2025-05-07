import { ViewMode } from "@/types/auxilary";
import "./ViewToggle.css"


interface ViewToggleProps {
  onViewChange: (viewId: ViewMode) => void; 
  currentView: ViewMode; 
  options: ViewMode[]; 
}

export default function ViewToggle({ 
  onViewChange, 
  currentView, 
  options 
}: ViewToggleProps) {
  return (
    <div className="viewToggleContainer">
      <div className="viewToggle">
        {options.map((option:ViewMode) => (
          <button
            key={option.label}
            className={`viewButton ${currentView.label === option.label ? "activeView" : ""}`}
            onClick={() => onViewChange(option)}
          >
            {option.icon?option.icon:""}
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}