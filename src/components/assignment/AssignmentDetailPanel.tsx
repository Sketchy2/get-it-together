"use client"

import type React from "react"
import "./AssignmentDetails.css"
import {
  X,
  ChevronRight,
  ChevronDown,
  Maximize2,
  Calendar,
  Weight,
  Flag,
  Clock,
  FileText,
  Edit,
  Filter,
  Link,
  Upload,
  Plus,
} from "lucide-react"
import { useState, useRef, useEffect } from "react"
import ProgressCircle from "../common/ProgressCircle"
import { SortDirection, SortOption } from "@/types/sort"
import SortMenu from "../common/SortMenu"
import TaskCard from "../task/TaskCard"
import { Task } from "@/types/task"
import {AssignmentLink, FileAttachment} from "@/types/assignment"
import { formatDate, isLate } from "@/utils/utils"
import {  calculateProgress, getCardBgColor } from "@/utils/assignmentUtils"
import FilesLinksSection from "./FilesLinksSection"

interface AssignmentDetailsProps {
  id: string
  title: string
  createdAt: string
  deadline: string
  weighting: number
  description: string
  files?: FileAttachment[]
  links?: AssignmentLink[]
  tasks: Task[]
  members?: string[] 

  onClose: () => void
  onTodoToggle: (id: string) => void
  onAddTodo: () => void
  onExpand: () => void
}

// TODO: CHANGE SO PASSES ASSIGNMENTOPBJECT
const AssignmentDetailPanel: React.FC<AssignmentDetailsProps> = ({
  id,
  title,
  description,
  createdAt,
  deadline,
  weighting,
  members,
  tasks,
  files = [],
  links = [],

  onClose,
  onTodoToggle,
  onAddTodo,
  onExpand,
}) => {
  const sortOptions:SortOption[] = [
    { key: "deadline", label: "Due Date", icon: <Calendar size={16} /> },
    { key: "createdAt", label: "Created Date", icon: <Clock size={16} /> },
    { key: "weighting", label: "weighting", icon: <Weight size={16} /> },
    { key: "priority", label: "Priority", icon: <Flag size={16} /> },
  ] as const;

  const progress: number = calculateProgress(tasks);
  const islate: boolean = isLate(deadline);
  const bgColor: string = getCardBgColor(tasks,deadline)
  
  const [isEditing, setIsEditing] = useState(false)
  const [editedDescription, setEditedDescription] = useState(description)
  const [showFiles, setShowFiles] = useState(false)
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false)
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>(sortOptions[0])
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [filters, setFilters] = useState({
    status: [] as string[],
    priority: [] as string[],
    members: [] as string[],
    dateRange: {
      start: "",
      end: "",
    },
  })

  const filterMenuRef = useRef<HTMLDivElement>(null)
  const sortMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Add click outside listener for menus
    const handleClickOutside = (event: MouseEvent) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setIsFilterMenuOpen(false)
      }
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setIsSortMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])


  const handleSaveDescription = () => {
    // In a real app, this would save to the backend
    setIsEditing(false)
    // You would call onUpdate here with the new description
  }

  const toggleFilterMenu = () => {
    setIsFilterMenuOpen(!isFilterMenuOpen)
    setIsSortMenuOpen(false)
  }

  const toggleSortMenu = () => {
    setIsSortMenuOpen(!isSortMenuOpen)
    setIsFilterMenuOpen(false)
  }

  const handleFilterChange = (filterType: "status" | "priority" | "members", value: string) => {
    const currentFilters = [...filters[filterType]]
    const index = currentFilters.indexOf(value)

    if (index === -1) {
      currentFilters.push(value)
    } else {
      currentFilters.splice(index, 1)
    }

    setFilters({
      ...filters,
      [filterType]: currentFilters,
    })
  }

  const handleSortChange = (sortType: SortOption) => {
    if (sortBy.key === sortType.key) {
      // Toggle direction if same sort type
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortBy(sortType)
      setSortDirection("asc")
    }
  }

  const applyFiltersAndSort = (todoList: Task[]) => {
    // Apply filters
    let filteredTodos = todoList

    // Filter by status
    if (filters.status.length > 0) {
      filteredTodos = filteredTodos.filter((todo) => filters.status.includes(todo.status || "To-do"))
    }

    // Filter by priority
    if (filters.priority.length > 0) {
      filteredTodos = filteredTodos.filter((todo) => filters.priority.includes(todo.priority || "medium"))
    }

    // Filter by members TODO:FIX FILTERS
    if (filters.members.length > 0) {
      filteredTodos = filteredTodos.filter((todo) => todo.assignee && filters.members.includes(todo.assignee[0].name))
    }

    // Filter by date range
    if (filters.dateRange.start || filters.dateRange.end) {
      filteredTodos = filteredTodos.filter((todo) => {
        if (!todo.deadline) return false

        const deadline = new Date(todo.deadline)
        let isInRange = true

        if (filters.dateRange.start) {
          const startDate = new Date(filters.dateRange.start)
          isInRange = isInRange && deadline >= startDate
        }

        if (filters.dateRange.end) {
          const endDate = new Date(filters.dateRange.end)
          isInRange = isInRange && deadline <= endDate
        }

        return isInRange
      })
    }

    // Apply sorting
    return filteredTodos.sort((a, b) => {
      if (sortBy.key === "deadline") { // TODO: fix duedate +  createdAt
        if (!a.deadline) return sortDirection === "asc" ? 1 : -1
        if (!b.deadline) return sortDirection === "asc" ? -1 : 1

        const dateA = new Date(a.deadline).getTime()
        const dateB = new Date(b.deadline).getTime()

        return sortDirection === "asc" ? dateA - dateB : dateB - dateA
      } else if (sortBy.key === "weighting") {
        const weightA = a.weighting || 1
        const weightB = b.weighting || 1
        return sortDirection === "asc" ? weightA - weightB : weightB - weightA
      } else if (sortBy.key === "priority") {
        // Modified priority sorting to ensure high priority is at the top
        const priorityValues = { high: 3, medium: 2, low: 1 }
        const valueA = priorityValues[a.priority || "medium"] || 0
        const valueB = priorityValues[b.priority || "medium"] || 0

        // Always sort high priority first regardless of sort direction
        return sortDirection === "asc" ? valueB - valueA : valueA - valueB
      }
      return 0
    })
  }

  const handleDateRangeChange = (type: "start" | "end", value: string) => {
    setFilters({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [type]: value,
      },
    })
  }

  const filteredAndSortedTodos = applyFiltersAndSort(tasks)
  

  return (
    <div className="assignmentDetails">
      <div className="detailsHeader" style={{ backgroundColor: bgColor }}>
        <div className="headerContent">
          <h2 className="detailsTitle">{title}</h2>
          <div className="detailsMetaRow">
            <span className="detailsMeta">
              Due: {formatDate(deadline)} | Weighed: {weighting}%
            </span>
            <div className="statusIndicator">
              <span>{islate ? "Overdue" : progress === 100 ? "Completed" : "In Progress"}</span>
            </div>
          </div>
        </div>
        <button className="expandViewButton" onClick={onExpand} title="Expand to full view">
          <Maximize2 size={20} />
        </button>
        <button className="closeButton" onClick={onClose}>
          <X size={24} />
        </button>
        <ProgressCircle percentage={progress} />
      </div>

      <div className="detailsContent">
        <div className="detailsSection">
          <div className="sectionHeader">
            <h3 className="sectionTitle">Description</h3>
            <button className="editButton" onClick={() => setIsEditing(!isEditing)}>
              <Edit size={16} />
            </button>
          </div>
          {isEditing ? (
            <div className="editDescriptionContainer">
              <textarea
                className="descriptionTextarea"
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                rows={4}
              />
              <div className="editActions">
                <button className="cancelEditButton" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
                <button className="saveEditButton" onClick={handleSaveDescription}>
                  Save
                </button>
              </div>
            </div>
          ) : (
            <p className="descriptionText">{description}</p>
          )}
        </div>

        <div className="detailsSection">
          <FilesLinksSection 
          showFiles={showFiles} 
          setShowFiles={setShowFiles}
          files={files}
          links={links}
          
          />
        </div>

        <div className="detailsSection">
          <div className="sectionHeader">
            <h3 className="sectionTitle">Tasks</h3>
            <div className="sectionActions">
              <div className="filterContainer" ref={filterMenuRef}>
                <button className="actionButton" onClick={toggleFilterMenu}>
                  <Filter size={18} />
                </button>
                {isFilterMenuOpen && (
                  <div className="filterMenu">
                    <div className="filterSection">
                      <h4>Status</h4>
                      <div className="filterOptions">
                        <label className="filterOption">
                          <input
                            type="checkbox"
                            checked={filters.status.includes("todo")}
                            onChange={() => handleFilterChange("status", "todo")}
                          />
                          <span>To Do</span>
                        </label>
                        <label className="filterOption">
                          <input
                            type="checkbox"
                            checked={filters.status.includes("inProgress")}
                            onChange={() => handleFilterChange("status", "inProgress")}
                          />
                          <span>In Progress</span>
                        </label>
                        <label className="filterOption">
                          <input
                            type="checkbox"
                            checked={filters.status.includes("completed")}
                            onChange={() => handleFilterChange("status", "completed")}
                          />
                          <span>Completed</span>
                        </label>
                        <label className="filterOption">
                          <input
                            type="checkbox"
                            checked={filters.status.includes("unassigned")}
                            onChange={() => handleFilterChange("status", "unassigned")}
                          />
                          <span>Unassigned</span>
                        </label>
                      </div>
                    </div>
                    <div className="filterSection">
                      <h4>Priority</h4>
                      <div className="filterOptions">
                        <label className="filterOption">
                          <input
                            type="checkbox"
                            checked={filters.priority.includes("high")}
                            onChange={() => handleFilterChange("priority", "high")}
                          />
                          <span>High</span>
                        </label>
                        <label className="filterOption">
                          <input
                            type="checkbox"
                            checked={filters.priority.includes("medium")}
                            onChange={() => handleFilterChange("priority", "medium")}
                          />
                          <span>Medium</span>
                        </label>
                        <label className="filterOption">
                          <input
                            type="checkbox"
                            checked={filters.priority.includes("low")}
                            onChange={() => handleFilterChange("priority", "low")}
                          />
                          <span>Low</span>
                        </label>
                      </div>
                    </div>
                    <div className="filterSection">
                      <h4>Members</h4>
                      <div className="filterOptions">
                        {members?.map((member: string) => (
                          <label key={member} className="filterOption">
                            <input
                              type="checkbox"
                              checked={filters.members?.includes(member) || false}
                              onChange={() => handleFilterChange("members", member)}
                            />
                            <span>{member}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="filterSection">
                      <h4>Date Range</h4>
                      <div className="dateRangeInputs">
                        <div className="dateInput">
                          <label>From:</label>
                          <input
                            type="date"
                            value={filters.dateRange.start}
                            onChange={(e) => handleDateRangeChange("start", e.target.value)}
                          />
                        </div>
                        <div className="dateInput">
                          <label>To:</label>
                          <input
                            type="date"
                            value={filters.dateRange.end}
                            onChange={(e) => handleDateRangeChange("end", e.target.value)}
                          />
                        </div>
                      </div>
                      {(filters.dateRange.start || filters.dateRange.end) && (
                        <button
                          className="clearDateButton"
                          onClick={() => setFilters({ ...filters, dateRange: { start: "", end: "" } })}
                        >
                          Clear Date Filter
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
                        <SortMenu
                          sortMenuOpen={isSortMenuOpen}
                          setSortMenuOpen={toggleSortMenu}
                          sortBy={sortBy}
                          sortDirection={sortDirection}
                          handleSortChange={handleSortChange}
                          options = {sortOptions}
                        />


            </div>
          </div>

          <div className="todoList">
            {filteredAndSortedTodos.length > 0 ? (
              filteredAndSortedTodos.map((task) =>
                <TaskCard key={task.id} task={task} onStatusChange={onTodoToggle} />)
              
  
            ) : (
              <div className="emptyTodoState">
                <p>No tasks added yet</p>
              </div>
            )}
             <button className="addTaskButton" onClick={onAddTodo}>
              <Plus size={18} />
              <span>Add New Task</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssignmentDetailPanel
