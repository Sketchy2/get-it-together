"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Filter } from "lucide-react"
import type { Assignment } from "@/types/assignment"
import "./CalendarToolbar.css"

interface CalendarToolbarProps {
  date: Date
  onNavigate: (action: "PREV" | "NEXT" | "TODAY" | Date) => void
  label: string
  assignments: Assignment[]
  filterAssignments: string[]
  onFilterChange: (assignmentId: string) => void
}

export default function CalendarToolbar({
  date,
  onNavigate,
  label,
  assignments,
  filterAssignments,
  onFilterChange,
}: CalendarToolbarProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  return (
    <div className="calendarToolbar">
      <div className="toolbarLeft">
        <button type="button" className="toolbarButton" onClick={() => onNavigate("TODAY")}>
          Today
        </button>
        <button type="button" className="toolbarButton iconButton" onClick={() => onNavigate("PREV")}>
          <ChevronLeft size={20} />
        </button>
        <button type="button" className="toolbarButton iconButton" onClick={() => onNavigate("NEXT")}>
          <ChevronRight size={20} />
        </button>
        <span className="toolbarLabel">{label}</span>
      </div>
      <div className="toolbarRight">
        <div className="filterContainer">
          <button type="button" className="toolbarButton filterButton" onClick={() => setIsFilterOpen(!isFilterOpen)}>
            <Filter size={16} />
            <span>Filter</span>
            {filterAssignments.length > 0 && <span className="filterCount">{filterAssignments.length}</span>}
          </button>
          {isFilterOpen && (
            <div className="filterDropdown">
              <div className="filterHeader">
                <h4>Filter by Assignment</h4>
                {filterAssignments.length > 0 && (
                  <button
                    type="button"
                    className="clearFiltersButton"
                    onClick={() => {
                      assignments.forEach((assignment) => {
                        if (filterAssignments.includes(assignment.id)) {
                          onFilterChange(assignment.id)
                        }
                      })
                    }}
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="filterOptions">
                {assignments.map((assignment) => (
                  <label key={assignment.id} className="filterOption">
                    <input
                      type="checkbox"
                      checked={filterAssignments.includes(assignment.id)}
                      onChange={() => onFilterChange(assignment.id)}
                    />
                    <span className="filterOptionLabel">{assignment.title}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
