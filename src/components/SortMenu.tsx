import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ArrowUpRightIcon,
  Calendar,
  Clock,
} from "lucide-react";
import { SortOption, SortDirection } from "@/types/sort";
import "./SortMenu.css";

interface SortMenuProps {
  sortMenuOpen: boolean;
  setSortMenuOpen: (open: boolean) => void;
  sortBy: SortOption;
  sortDirection: SortDirection;
  handleSortChange: (sortKey: SortOption) => void;
  options: SortOption[];
}

export default function SortMenu({
  sortMenuOpen,
  setSortMenuOpen,
  sortBy,
  sortDirection,
  handleSortChange,
  options,
}: SortMenuProps) {
  return (
    <div className="sortDropdown">
      <button
        className="iconButton"
        onClick={() => setSortMenuOpen(!sortMenuOpen)}
      >
        <ArrowUpDown size={18} />
      </button>

      {
        sortMenuOpen && (
          <div className="sortMenu">
            {options.map((option) => (
              <button
                key={option.key}
                className={`sortOption ${sortBy === option ? "active" : ""}`}
                onClick={() => handleSortChange(option)}
              >
                {option.icon}
                <span>{option.label}</span>
                {sortBy.key === option.key && (
                  <span className="sortDirection">
                    {sortDirection === "asc" ? (
                      <ArrowUp size={14} />
                    ) : (
                      <ArrowDown size={14} />
                    )}
                  </span>
                )}
              </button>
            ))}
          </div>
        )

        // (
        //   <div className="sortMenu">
        //     <button
        //       className={`sortOption ${sortBy === "dueDate" ? "active" : ""}`}
        //       onClick={() => handleSortChange("dueDate")}
        //     >
        //       <Calendar size={16} />
        //       <span>Due Date</span>
        //       {sortBy === "dueDate" && (
        //         sortDirection === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />
        //       )}
        //     </button>

        //     <button
        //       className={`sortOption ${sortBy === "createdAt" ? "active" : ""}`}
        //       onClick={() => handleSortChange("createdAt")}
        //     >
        //       <Clock size={16} />
        //       <span>Created Date</span>
        //       {sortBy === "createdAt" && (
        //         sortDirection === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />
        //       )}
        //     </button>
        //   </div>
        // )
      }
    </div>
  );
}
