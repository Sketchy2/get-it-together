"use client"

import type React from "react"
import "./AssignmentDetails.css"
import {
  X,
  CheckCircle,
  Circle,
  ChevronRight,
  ChevronDown,
  Plus,
  Maximize2,
  User,
  Calendar,
  Weight,
  Flag,
  Clock,
  MoreVertical,
  FileText,
  Edit,
  Filter,
  ArrowUpDown,
  Link,
  Upload,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import ProgressCircle from "./ProgressCircle"

interface TodoItem {
  id: string
  text: string
  completed: boolean
  expanded?: boolean
  assignee?: string
  dueDate?: string
  weight?: number
  priority?: "low" | "medium" | "high"
  status?: "unassigned" | "todo" | "inProgress" | "completed"
}

interface AssignmentDetailsProps {
  id: string
  title: string
  date: string
  dueDate: string
  weight: number
  description: string
  progress: number
  daysRemaining: number
  isLate: boolean
  bgColor: string
  todos: TodoItem[]
  files?: string[]
  links?: { url: string; title: string }[]
  onClose: () => void
  onTodoToggle: (id: string) => void
  onTodoExpand: (id: string) => void
  onAddTodo: () => void
  onExpand: () => void
  assignment?: { members?: string[] }
}

const AssignmentDetails: React.FC<AssignmentDetailsProps> = ({
  id,
  title,
  date,
  dueDate,
  weight,
  description,
  progress,
  daysRemaining,
  isLate,
  bgColor,
  todos,
  files = [],
  links = [],
  onClose,
  onTodoToggle,
  onTodoExpand,
  onAddTodo,
  onExpand,
  assignment,
}) => {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [editedDescription, setEditedDescription] = useState(description)
  const [showFiles, setShowFiles] = useState(false)
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false)
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false)
  const [sortBy, setSortBy] = useState<"dueDate" | "weight" | "priority">("dueDate")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
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

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "No date set"
    return dateString
  }

  // Get priority icon and color
  const getPriorityInfo = (priority?: string) => {
    switch (priority) {
      case "high":
        return { color: "#e74c3c" }
      case "medium":
        return { color: "#f39c12" }
      case "low":
        return { color: "#3498db" }
      default:
        return { color: "#95a5a6" }
    }
  }

  // Get status color
  const getStatusColor = (status?: string, completed?: boolean) => {
    if (completed) return "#647a67" // Green for completed
    if (status === "inProgress") return "#4d5696" // Purple for in progress
    if (status === "todo") return "#DD992B" // Gold for todo
    return "#777777" // Gray for unassigned
  }

  const navigateToHome = () => {
    router.push("/dashboard")
  }

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

  const handleSortChange = (sortType: "dueDate" | "weight" | "priority") => {
    if (sortBy === sortType) {
      // Toggle direction if same sort type
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortBy(sortType)
      setSortDirection("asc")
    }
  }

  const applyFiltersAndSort = (todoList: TodoItem[]) => {
    // Apply filters
    let filteredTodos = todoList

    // Filter by status
    if (filters.status.length > 0) {
      filteredTodos = filteredTodos.filter((todo) => filters.status.includes(todo.status || "todo"))
    }

    // Filter by priority
    if (filters.priority.length > 0) {
      filteredTodos = filteredTodos.filter((todo) => filters.priority.includes(todo.priority || "medium"))
    }

    // Filter by members
    if (filters.members.length > 0) {
      filteredTodos = filteredTodos.filter((todo) => todo.assignee && filters.members.includes(todo.assignee))
    }

    // Filter by date range
    if (filters.dateRange.start || filters.dateRange.end) {
      filteredTodos = filteredTodos.filter((todo) => {
        if (!todo.dueDate) return false

        const dueDate = new Date(todo.dueDate)
        let isInRange = true

        if (filters.dateRange.start) {
          const startDate = new Date(filters.dateRange.start)
          isInRange = isInRange && dueDate >= startDate
        }

        if (filters.dateRange.end) {
          const endDate = new Date(filters.dateRange.end)
          isInRange = isInRange && dueDate <= endDate
        }

        return isInRange
      })
    }

    // Apply sorting
    return filteredTodos.sort((a, b) => {
      if (sortBy === "dueDate") {
        if (!a.dueDate) return sortDirection === "asc" ? 1 : -1
        if (!b.dueDate) return sortDirection === "asc" ? -1 : 1

        const dateA = new Date(a.dueDate).getTime()
        const dateB = new Date(b.dueDate).getTime()

        return sortDirection === "asc" ? dateA - dateB : dateB - dateA
      } else if (sortBy === "weight") {
        const weightA = a.weight || 1
        const weightB = b.weight || 1
        return sortDirection === "asc" ? weightA - weightB : weightB - weightA
      } else if (sortBy === "priority") {
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

  const filteredAndSortedTodos = applyFiltersAndSort(todos)

  return (
    <div className="assignmentDetails">
      <div className="detailsHeader" style={{ backgroundColor: bgColor }}>
        <div className="headerContent">
          <h2 className="detailsTitle">{title}</h2>
          <div className="detailsMetaRow">
            <span className="detailsMeta">
              {date} + day due | weighing: {weight}%
            </span>
            <div className="statusIndicator">
              <span>{isLate ? "Overdue" : progress === 100 ? "Completed" : "In Progress"}</span>
            </div>
          </div>
        </div>
        <button className="expandViewButton" onClick={onExpand} title="Expand to full view">
          <Maximize2 size={20} />
        </button>
        <button className="closeButton" onClick={onClose}>
          <X size={24} />
        </button>
        <ProgressCircle percentage={progress}/>
        {/* <div className="progressCircleContainer">
          <div className="progress-circle">
            <svg viewBox="0 0 36 36">
              <path
                className="progress-circle-bg"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="progress-circle-fill"
                strokeDasharray={`${progress}, 100`}
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <text x="18" y="20.35" className="progress-text">
                {progress}%
              </text>
            </svg>
          </div>
        </div> */}
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
          <div className="sectionHeader">
            <h3 className="sectionTitle">Files</h3>
            <button className="toggleFilesButton" onClick={() => setShowFiles(!showFiles)}>
              {showFiles ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>
          </div>
          {showFiles && (
            <div className="filesContainer">
              {files.length > 0 ? (
                files.map((file, index) => (
                  <div key={index} className="fileItem">
                    <FileText size={16} />
                    <span className="fileName">{file}</span>
                  </div>
                ))
              ) : links && links.length > 0 ? (
                links.map((link: { url: string; title: string }, index: number) => (
                  <div key={`link-${index}`} className="fileItem linkItem">
                    <Link size={16} />
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="fileName linkName">
                      {link.title}
                    </a>
                  </div>
                ))
              ) : (
                <div className="emptyFilesState">No files or links attached</div>
              )}
              <div className="fileActions">
                <button className="fileActionButton">
                  <Upload size={16} />
                  <span>Upload File</span>
                </button>
                <button className="fileActionButton">
                  <Link size={16} />
                  <span>Add Link</span>
                </button>
              </div>
            </div>
          )}
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
                        {assignment?.members?.map((member: string) => (
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
              <div className="sortContainer" ref={sortMenuRef}>
                <button className="actionButton" onClick={toggleSortMenu}>
                  <ArrowUpDown size={18} />
                </button>
                {isSortMenuOpen && (
                  <div className="sortMenu">
                    <button
                      className={`sortOption ${sortBy === "dueDate" ? "active" : ""}`}
                      onClick={() => handleSortChange("dueDate")}
                    >
                      <Calendar size={16} />
                      <span>Due Date</span>
                      {sortBy === "dueDate" && (
                        <span className="sortDirection">
                          {sortDirection === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                        </span>
                      )}
                    </button>
                    <button
                      className={`sortOption ${sortBy === "weight" ? "active" : ""}`}
                      onClick={() => handleSortChange("weight")}
                    >
                      <Weight size={16} />
                      <span>Weight</span>
                      {sortBy === "weight" && (
                        <span className="sortDirection">
                          {sortDirection === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                        </span>
                      )}
                    </button>
                    <button
                      className={`sortOption ${sortBy === "priority" ? "active" : ""}`}
                      onClick={() => handleSortChange("priority")}
                    >
                      <Flag size={16} />
                      <span>Priority</span>
                      {sortBy === "priority" && (
                        <span className="sortDirection">
                          {sortDirection === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                        </span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="todoList">
            {filteredAndSortedTodos.length > 0 ? (
              filteredAndSortedTodos.map((todo) => (
                <div
                  key={todo.id}
                  className={`taskCard ${todo.completed ? "completed" : ""} ${todo.status || "todo"} ${
                    todo.expanded ? "expanded" : ""
                  }`}
                >
                  <div className="taskCardHeader">
                    <button
                      className="checkButton"
                      onClick={() => onTodoToggle(todo.id)}
                      aria-label={todo.completed ? "Mark as incomplete" : "Mark as complete"}
                    >
                      {todo.completed ? (
                        <CheckCircle size={20} className="checkIcon completed" />
                      ) : (
                        <Circle size={20} className="checkIcon" />
                      )}
                    </button>

                    <div className="taskTitleContainer">
                      <h4 className={`taskTitle ${todo.completed ? "completed" : ""}`}>{todo.text}</h4>
                      <div className="taskBadges">
                        <div
                          className="taskStatusIndicator"
                          style={{ backgroundColor: getStatusColor(todo.status, todo.completed) }}
                        >
                          {todo.status === "unassigned" && "Unassigned"}
                          {todo.status === "todo" && "To Do"}
                          {todo.status === "inProgress" && "In Progress"}
                          {todo.status === "completed" && "Completed"}
                          {!todo.status && (todo.completed ? "Completed" : "To Do")}
                        </div>
                        {todo.weight && todo.weight > 1 && (
                          <div className="taskWeightBadge">
                            <Weight size={12} />
                            <span>{todo.weight}%</span>
                          </div>
                        )}
                        {todo.priority && (
                          <div
                            className="taskPriorityBadge"
                            style={{ backgroundColor: getPriorityInfo(todo.priority).color }}
                          >
                            <Flag size={12} />
                            <span>{todo.priority}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="taskCardActions">
                      <button
                        className="expandButton"
                        onClick={() => onTodoExpand(todo.id)}
                        aria-label={todo.expanded ? "Collapse task" : "Expand task"}
                      >
                        {todo.expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </button>
                      <button className="menuButton">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </div>

                  {todo.expanded && (
                    <div className="taskCardContent">
                      <div className="taskDetailGrid">
                        {todo.assignee && (
                          <div className="taskDetailItem">
                            <div className="taskDetailLabel">
                              <User size={14} />
                              <span>Assignee</span>
                            </div>
                            <div className="taskDetailValue">
                              <div className="assigneeInfo">
                                <div className="assigneeAvatar">{todo.assignee.charAt(0).toUpperCase()}</div>
                                <span>{todo.assignee}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {todo.dueDate && (
                          <div className="taskDetailItem">
                            <div className="taskDetailLabel">
                              <Calendar size={14} />
                              <span>Due Date</span>
                            </div>
                            <div className="taskDetailValue">
                              <span>{formatDate(todo.dueDate)}</span>
                            </div>
                          </div>
                        )}

                        {todo.weight && (
                          <div className="taskDetailItem">
                            <div className="taskDetailLabel">
                              <Weight size={14} />
                              <span>Weight</span>
                            </div>
                            <div className="taskDetailValue">
                              <div className="weightInfo">
                                <div className="weightBar">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <div
                                      key={i}
                                      className={`weightUnit ${i < (todo.weight || 1) ? "active" : ""}`}
                                      style={{ opacity: i < (todo.weight || 1) ? 1 : 0.3 }}
                                    ></div>
                                  ))}
                                </div>
                                <span>{todo.weight || 1}% of total weight</span>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="taskDetailItem">
                          <div className="taskDetailLabel">
                            <Clock size={14} />
                            <span>Status</span>
                          </div>
                          <div className="taskDetailValue">
                            <span>
                              {todo.completed
                                ? "Completed"
                                : todo.status === "inProgress"
                                  ? "In Progress"
                                  : todo.status === "unassigned"
                                    ? "Unassigned"
                                    : "To Do"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
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

export default AssignmentDetails
