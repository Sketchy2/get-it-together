import "./ViewToggle.css"
interface ViewToggleProps {
    onclick: () => void; // passed in function should switch the views 
    viewMode: "kanban" | "list";
  }
  
  export default function ViewToggle({ onclick, viewMode }: ViewToggleProps) {
    return (
      <div className="viewToggleContainer" onClick={onclick}>
        <div className="viewToggle">
          <button
            className={`viewButton ${viewMode === "kanban" ? "activeView" : ""}`}
            
          >
            Kanban
          </button>
  
          <button
            className={`viewButton ${viewMode === "list" ? "activeView" : ""}`}
          >
            List
          </button>
        </div>
      </div>
    );
  }
  