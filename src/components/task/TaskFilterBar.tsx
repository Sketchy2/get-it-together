"use client"

import { ListFilter, Layers, Flag, Calendar } from "lucide-react"
import "./TaskFilterBar.css"

type GroupBy = "assignment" | "priority" | "dueDate"
type FilterStatus = "all" | "active" | "completed"

interface TaskFilterBarProps {
  currentFilter: FilterStatus
  onFilterChange: (filter: FilterStatus) => void
  currentGrouping: GroupBy
  onGroupingChange: (grouping: GroupBy) => void
}

export default function TaskFilterBar({
  currentFilter,
  onFilterChange,
  currentGrouping,
  onGroupingChange,
}: TaskFilterBarProps) {
  return (
    <div className="taskFilterBar">
      <div className="filterSection">
        <div className="filterLabel">
          <ListFilter size={16} />
          <span>Status:</span>
        </div>
        <div className="filterOptions">
          <button
            className={`filterButton ${currentFilter === "all" ? "active" : ""}`}
            onClick={() => onFilterChange("all")}
          >
            All
          </button>
          <button
            className={`filterButton ${currentFilter === "active" ? "active" : ""}`}
            onClick={() => onFilterChange("active")}
          >
            Active
          </button>
          <button
            className={`filterButton ${currentFilter === "completed" ? "active" : ""}`}
            onClick={() => onFilterChange("completed")}
          >
            Completed
          </button>
        </div>
      </div>

      <div className="filterSection">
        <div className="filterLabel">
          <Layers size={16} />
          <span>Group by:</span>
        </div>
        <div className="filterOptions">
          <button
            className={`filterButton ${currentGrouping === "assignment" ? "active" : ""}`}
            onClick={() => onGroupingChange("assignment")}
          >
            <Layers size={14} />
            <span>Assignment</span>
          </button>
          <button
            className={`filterButton ${currentGrouping === "priority" ? "active" : ""}`}
            onClick={() => onGroupingChange("priority")}
          >
            <Flag size={14} />
            <span>Priority</span>
          </button>
          <button
            className={`filterButton ${currentGrouping === "dueDate" ? "active" : ""}`}
            onClick={() => onGroupingChange("dueDate")}
          >
            <Calendar size={14} />
            <span>Due Date</span>
          </button>
        </div>
      </div>
    </div>
  )
}
