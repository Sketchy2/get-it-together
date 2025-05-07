import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
} from "lucide-react";
import { SortOption, SortDirection } from "@/types/auxilary";
import "./SortMenu.css";
import { useOnClickOutside } from "@/utils/utils";
import { useRef } from "react";

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

  const dropdownRef = useRef(null)
  useOnClickOutside(dropdownRef,()=>setSortMenuOpen(false))

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
          <div ref={dropdownRef} className="sortMenu">
            {options.map((option) => (
              <button
                key={option.key}
                className={`sortOption ${sortBy.key === option.key ? "active" : ""}`}
                onClick={() => handleSortChange(option)}
              >
                <span>{option.label}</span>
                      {sortBy.key === option.key &&
                        (sortDirection === "asc" ? (
                          <ArrowUp size={16} />
                        ) : (
                          <ArrowDown size={16} />
                        ))}

              </button>
            ))}
          </div>
        )

        // (
        //   <div className="sortMenu">
        //     <button
        //       className={`sortOption ${sortBy === "deadline" ? "active" : ""}`}
        //       onClick={() => handleSortChange("deadline")}
        //     >
        //       <Calendar size={16} />
        //       <span>Due Date</span>
        //       {sortBy === "deadline" && (
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
