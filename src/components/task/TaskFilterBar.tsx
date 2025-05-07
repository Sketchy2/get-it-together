"use client"

import { Layers, Flag, Calendar } from "lucide-react"
import "./TaskFilterBar.css"

type GroupBy = "assignment" | "priority" | "dueDate"
type FilterStatus = "all" | "active" | "completed" | "To-Do" | "In Progress" | "Completed"

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
    <div className="taskFilterBar single-line">
      {/* Status section with label */}
      <div className="statusSection">
        <div className="filterLabel">
          <span>Status:</span>
        </div>

        <button
          className={`filterButton ${currentFilter === "all" ? "active" : ""}`}
          onClick={() => onFilterChange("all")}
        >
          All
        </button>
        <button
          className={`filterButton ${currentFilter === "To-Do" ? "active" : ""}`}
          onClick={() => onFilterChange("To-Do")}
        >
          To Do
        </button>
        <button
          className={`filterButton ${currentFilter === "In Progress" ? "active" : ""}`}
          onClick={() => onFilterChange("In Progress")}
        >
          In Progress
        </button>
        <button
          className={`filterButton ${currentFilter === "Completed" ? "active" : ""}`}
          onClick={() => onFilterChange("Completed")}
        >
          Completed
        </button>
      </div>

      {/* Divider */}
      <div className="filterDivider"></div>

      {/* Group by section with label */}
      <div className="groupSection">
        <div className="filterLabel">
          <Layers size={16} />
          <span>Group by:</span>
        </div>

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
  )
}
