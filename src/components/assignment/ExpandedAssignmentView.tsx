"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import {
  X,
  Plus,
  ChevronLeft,
  User,
  Paperclip,
  Calendar,
  LayoutGrid,
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  HelpCircle,
  BarChart,
  Filter,
  ArrowUp,
  ArrowDown,
  FileText,
  Edit,
  ChevronDown,
  ChevronRight,
  Flag,
  Link,
  Upload,
} from "lucide-react"
import "./ExpandedAssignmentView.css"
import TaskCard from "./TaskCard"
import CreateTaskModal from "./CreateTaskModal"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import ProgressCircle from "./ProgressCircle"

interface Task {
  id: string
  title: string
  description: string
  assignee?: string
  dueDate?: string
  completed: boolean
  status: "unassigned" | "todo" | "inProgress" | "completed"
  weight: number
  createdAt: string
  priority: "low" | "medium" | "high"
}

interface ExpandedAssignmentViewProps {
  assignment: any
  isOpen: boolean
  onClose: () => void
  onUpdate: (updatedAssignment: any) => void
}

const ExpandedAssignmentView: React.FC<ExpandedAssignmentViewProps> = ({ assignment, isOpen, onClose, onUpdate }) => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false)
  const [progress, setProgress] = useState(0)
  const [viewMode, setViewMode] = useState<"status" | "member">("status")
  const [memberProgress, setMemberProgress] = useState<Record<string, number>>({})
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false)
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false)
  const [sortBy, setSortBy] = useState<"dueDate" | "weight" | "priority">("dueDate")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [filters, setFilters] = useState({
    status: [] as string[],
    priority: [] as string[],
    dueDate: "all" as "all" | "today" | "week" | "month",
  })
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [editedDescription, setEditedDescription] = useState("")
  const [showFiles, setShowFiles] = useState(false)

  const filterMenuRef = useRef<HTMLDivElement>(null)
  const sortMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (assignment && assignment.todos) {
      // Convert todos to tasks format if needed
      const convertedTasks = assignment.todos.map((todo: any) => ({
        id: todo.id,
        title: todo.text,
        description: todo.description || "",
        assignee: todo.assignee,
        dueDate: todo.dueDate,
        completed: todo.completed,
        status: todo.status || (todo.assignee ? "todo" : "unassigned"),
        weight: todo.weight || 1,
        createdAt: todo.createdAt || new Date().toISOString(),
        priority: todo.priority || "medium",
      }))

      setTasks(convertedTasks)
      calculateProgress(convertedTasks)
      calculateMemberProgress(convertedTasks)
    } else if (assignment && assignment.tasks) {
      setTasks(assignment.tasks)
      calculateProgress(assignment.tasks)
      calculateMemberProgress(assignment.tasks)
    } else {
      setTasks([])
    }

    if (assignment) {
      setEditedDescription(assignment.description || "")
    }

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
  }, [assignment])

  if (!isOpen || !assignment) return null

  const calculateProgress = (taskList: Task[]) => {
    if (taskList.length === 0) {
      setProgress(0)
      return
    }

    // Calculate weighted progress
    const totalWeight = taskList.reduce((sum, task) => sum + task.weight, 0)
    if (totalWeight === 0) {
      setProgress(0)
      return
    }

    const completedWeight = taskList.filter((task) => task.completed).reduce((sum, task) => sum + task.weight, 0)

    const newProgress = Math.round((completedWeight / totalWeight) * 100)
    setProgress(newProgress)

    // Update the assignment progress
    if (onUpdate && newProgress !== assignment.progress) {
      onUpdate({
        ...assignment,
        progress: newProgress,
        tasks: taskList,
      })
    }
  }

  const calculateMemberProgress = (taskList: Task[]) => {
    const members = getUniqueAssignees()
    const progressByMember: Record<string, number> = {}

    members.forEach((member) => {
      const memberTasks = taskList.filter((task) => task.assignee === member)
      if (memberTasks.length === 0) {
        progressByMember[member] = 0
        return
      }

      const totalWeight = memberTasks.reduce((sum, task) => sum + task.weight, 0)
      if (totalWeight === 0) {
        progressByMember[member] = 0
        return
      }

      const completedWeight = memberTasks.filter((task) => task.completed).reduce((sum, task) => sum + task.weight, 0)

      progressByMember[member] = Math.round((completedWeight / totalWeight) * 100)
    })

    setMemberProgress(progressByMember)
  }

  const handleCreateTask = (newTask: Task) => {
    const updatedTasks = [...tasks, newTask]
    setTasks(updatedTasks)
    calculateProgress(updatedTasks)
    calculateMemberProgress(updatedTasks)
    setIsCreateTaskModalOpen(false)

    // Also update the todos in the assignment for consistency
    const newTodo = {
      id: newTask.id,
      text: newTask.title,
      description: newTask.description,
      assignee: newTask.assignee,
      dueDate: newTask.dueDate,
      completed: newTask.completed,
      expanded: false,
      weight: newTask.weight,
      status: newTask.status,
      createdAt: newTask.createdAt,
      priority: newTask.priority,
    }

    const updatedAssignment = {
      ...assignment,
      todos: [...(assignment.todos || []), newTodo],
      tasks: updatedTasks,
    }

    onUpdate(updatedAssignment)
  }

  const handleTaskStatusChange = (taskId: string, newStatus: "unassigned" | "todo" | "inProgress" | "completed") => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        const completed = newStatus === "completed"
        return { ...task, status: newStatus, completed }
      }
      return task
    })

    setTasks(updatedTasks)
    calculateProgress(updatedTasks)
    calculateMemberProgress(updatedTasks)

    // Also update the todos in the assignment
    const updatedTodos = (assignment.todos || []).map((todo: any) => {
      if (todo.id === taskId) {
        return { ...todo, completed: newStatus === "completed", status: newStatus }
      }
      return todo
    })

    const updatedAssignment = {
      ...assignment,
      todos: updatedTodos,
      tasks: updatedTasks,
    }

    onUpdate(updatedAssignment)
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const { source, destination, draggableId } = result

    // If dropped in the same place
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return
    }

    // Find the task that was dragged
    const updatedTasks = [...tasks]
    const draggedTask = updatedTasks.find((task) => task.id === draggableId)

    if (!draggedTask) return

    // Remove from source
    const filteredTasks = updatedTasks.filter((task) => task.id !== draggableId)

    // Update status or assignee based on destination and view mode
    let updatedTask: Task

    if (viewMode === "status") {
      const newStatus = destination.droppableId as "unassigned" | "todo" | "inProgress" | "completed"
      const completed = newStatus === "completed"
      updatedTask = { ...draggedTask, status: newStatus, completed }
    } else {
      // In member view, we're changing the assignee but keeping the status
      updatedTask = {
        ...draggedTask,
        assignee: destination.droppableId === "unassigned" ? undefined : destination.droppableId,
      }
    }

    // Insert at destination
    filteredTasks.splice(destination.index, 0, updatedTask)

    setTasks(filteredTasks)
    calculateProgress(filteredTasks)
    calculateMemberProgress(filteredTasks)

    // Also update the todos in the assignment
    const updatedTodos = (assignment.todos || []).map((todo: any) => {
      if (todo.id === draggableId) {
        if (viewMode === "status") {
          return {
            ...todo,
            completed: updatedTask.completed,
            status: updatedTask.status,
          }
        } else {
          return {
            ...todo,
            assignee: updatedTask.assignee,
          }
        }
      }
      return todo
    })

    const updatedAssignment = {
      ...assignment,
      todos: updatedTodos,
      tasks: filteredTasks,
    }

    onUpdate(updatedAssignment)
  }

  const getTasksByStatus = (status: "unassigned" | "todo" | "inProgress" | "completed") => {
    return applyFiltersAndSort(tasks.filter((task) => task.status === status))
  }

  const getTasksByMember = (member: string | null) => {
    if (member === null) {
      return applyFiltersAndSort(tasks.filter((task) => !task.assignee))
    }
    return applyFiltersAndSort(tasks.filter((task) => task.assignee === member))
  }

  const getUniqueAssignees = () => {
    const assignees = tasks.map((task) => task.assignee).filter((assignee): assignee is string => !!assignee)

    return [...new Set(assignees)]
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "unassigned":
        return <HelpCircle size={18} />
      case "todo":
        return <Clock size={18} />
      case "inProgress":
        return <AlertTriangle size={18} />
      case "completed":
        return <CheckCircle size={18} />
      default:
        return <HelpCircle size={18} />
    }
  }

  const toggleFilterMenu = () => {
    setIsFilterMenuOpen(!isFilterMenuOpen)
    setIsSortMenuOpen(false)
  }

  const toggleSortMenu = () => {
    setIsSortMenuOpen(!isSortMenuOpen)
    setIsFilterMenuOpen(false)
  }

  const handleFilterChange = (filterType: "status" | "priority" | "dueDate", value: string) => {
    if (filterType === "dueDate") {
      setFilters({
        ...filters,
        dueDate: value as "all" | "today" | "week" | "month",
      })
    } else {
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

  const applyFiltersAndSort = (taskList: Task[]) => {
    // Apply filters
    let filteredTasks = taskList

    // Filter by status
    if (filters.status.length > 0) {
      filteredTasks = filteredTasks.filter((task) => filters.status.includes(task.status))
    }

    // Filter by priority
    if (filters.priority.length > 0) {
      filteredTasks = filteredTasks.filter((task) => filters.priority.includes(task.priority))
    }

    // Filter by due date
    if (filters.dueDate !== "all" && filteredTasks.some((task) => task.dueDate)) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const weekLater = new Date(today)
      weekLater.setDate(today.getDate() + 7)

      const monthLater = new Date(today)
      monthLater.setMonth(today.getMonth() + 1)

      filteredTasks = filteredTasks.filter((task) => {
        if (!task.dueDate) return false

        const dueDate = new Date(task.dueDate)
        dueDate.setHours(0, 0, 0, 0)

        if (filters.dueDate === "today") {
          return dueDate.getTime() === today.getTime()
        } else if (filters.dueDate === "week") {
          return dueDate >= today && dueDate <= weekLater
        } else if (filters.dueDate === "month") {
          return dueDate >= today && dueDate <= monthLater
        }
        return true
      })
    }

    // Apply sorting
    return filteredTasks.sort((a, b) => {
      if (sortBy === "dueDate") {
        if (!a.dueDate) return sortDirection === "asc" ? 1 : -1
        if (!b.dueDate) return sortDirection === "asc" ? -1 : 1

        const dateA = new Date(a.dueDate).getTime()
        const dateB = new Date(b.dueDate).getTime()

        return sortDirection === "asc" ? dateA - dateB : dateB - dateA
      } else if (sortBy === "weight") {
        return sortDirection === "asc" ? a.weight - b.weight : b.weight - a.weight
      } else if (sortBy === "priority") {
        const priorityValues = { high: 3, medium: 2, low: 1 }
        const valueA = priorityValues[a.priority] || 0
        const valueB = priorityValues[b.priority] || 0

        return sortDirection === "asc" ? valueA - valueB : valueB - valueA
      }
      return 0
    })
  }

  const handleSaveDescription = () => {
    const updatedAssignment = {
      ...assignment,
      description: editedDescription,
    }
    onUpdate(updatedAssignment)
    setIsEditingDescription(false)
  }

  // Update the kanban board rendering to ensure proper scrolling
  const renderStatusView = () => (
    <div className="kanbanBoard">
      <div className="kanbanColumn">
        <div className="columnHeader">
          <div className="columnHeaderTitle">
            {getStatusIcon("unassigned")}
            <h3>Unassigned</h3>
          </div>
          <span className="taskCount">{getTasksByStatus("unassigned").length}</span>
        </div>
        <Droppable droppableId="unassigned">
          {(provided) => (
            <div className="columnContent" {...provided.droppableProps} ref={provided.innerRef}>
              {getTasksByStatus("unassigned").map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                      <TaskCard task={task} onStatusChange={handleTaskStatusChange} />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>

      <div className="kanbanColumn">
        <div className="columnHeader">
          <div className="columnHeaderTitle">
            {getStatusIcon("todo")}
            <h3>To Do</h3>
          </div>
          <span className="taskCount">{getTasksByStatus("todo").length}</span>
        </div>
        <Droppable droppableId="todo">
          {(provided) => (
            <div className="columnContent" {...provided.droppableProps} ref={provided.innerRef}>
              {getTasksByStatus("todo").map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                      <TaskCard task={task} onStatusChange={handleTaskStatusChange} />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>

      <div className="kanbanColumn">
        <div className="columnHeader">
          <div className="columnHeaderTitle">
            {getStatusIcon("inProgress")}
            <h3>In Progress</h3>
          </div>
          <span className="taskCount">{getTasksByStatus("inProgress").length}</span>
        </div>
        <Droppable droppableId="inProgress">
          {(provided) => (
            <div className="columnContent" {...provided.droppableProps} ref={provided.innerRef}>
              {getTasksByStatus("inProgress").map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                      <TaskCard task={task} onStatusChange={handleTaskStatusChange} />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>

      <div className="kanbanColumn">
        <div className="columnHeader">
          <div className="columnHeaderTitle">
            {getStatusIcon("completed")}
            <h3>Completed</h3>
          </div>
          <span className="taskCount">{getTasksByStatus("completed").length}</span>
        </div>
        <Droppable droppableId="completed">
          {(provided) => (
            <div className="columnContent" {...provided.droppableProps} ref={provided.innerRef}>
              {getTasksByStatus("completed").map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                      <TaskCard task={task} onStatusChange={handleTaskStatusChange} />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </div>
  )

  const renderMemberView = () => {
    const members = getUniqueAssignees()

    return (
      <div className="kanbanBoard">
        <div className="kanbanColumn">
          <div className="columnHeader memberHeader">
            <div className="memberHeaderInfo">
              <div className="memberAvatar unassigned">
                <HelpCircle size={16} />
              </div>
              <h3>Unassigned</h3>
            </div>
            <span className="taskCount">{getTasksByMember(null).length}</span>
          </div>
          <Droppable droppableId="unassigned">
            {(provided) => (
              <div className="columnContent" {...provided.droppableProps} ref={provided.innerRef}>
                {getTasksByMember(null).map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                        <TaskCard task={task} onStatusChange={handleTaskStatusChange} />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>

        {members.map((member) => (
          <div className="kanbanColumn" key={member}>
            <div className="columnHeader memberHeader">
              <div className="memberHeaderInfo">
                <div className="memberAvatar">{member.charAt(0).toUpperCase()}</div>
                <h3>{member}</h3>
              </div>
              <div className="memberStats">
                <div className="memberProgress">
                  <div className="memberProgressBar" style={{ width: `${memberProgress[member] || 0}%` }}></div>
                  <span className="memberProgressText">{memberProgress[member] || 0}%</span>
                </div>
                <span className="taskCount">{getTasksByMember(member).length}</span>
              </div>
            </div>
            <div className="memberTaskStats">
              <div className="taskStatItem">
                <span className="taskStatDot todo"></span>
                <span className="taskStatLabel">To Do:</span>
                <span className="taskStatValue">
                  {getTasksByMember(member).filter((t) => t.status === "todo").length}
                </span>
              </div>
              <div className="taskStatItem">
                <span className="taskStatDot inProgress"></span>
                <span className="taskStatLabel">In Progress:</span>
                <span className="taskStatValue">
                  {getTasksByMember(member).filter((t) => t.status === "inProgress").length}
                </span>
              </div>
              <div className="taskStatItem">
                <span className="taskStatDot completed"></span>
                <span className="taskStatLabel">Completed:</span>
                <span className="taskStatValue">
                  {getTasksByMember(member).filter((t) => t.status === "completed").length}
                </span>
              </div>
            </div>
            <Droppable droppableId={member}>
              {(provided) => (
                <div className="columnContent memberTasks" {...provided.droppableProps} ref={provided.innerRef}>
                  {getTasksByMember(member).map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided) => (
                        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                          <TaskCard task={task} onStatusChange={handleTaskStatusChange} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="expandedViewOverlay">
      <div className="expandedViewContent">
        <div className="expandedViewHeader" style={{ backgroundColor: assignment.bgColor || "#DD992B" }}>
          <button className="backButton" onClick={onClose}>
            <ChevronLeft size={24} />
          </button>
          <div className="headerContent">
            <h2 className="assignmentTitle">{assignment.title}</h2>
            <div className="assignmentMeta">
              <div className="metaItem">
                <Calendar size={16} />
                <span>Due: {assignment.dueDate}</span>
              </div>
              <div className="metaItem">
                <Paperclip size={16} />
                <span>{assignment.files?.length || 0} files</span>
              </div>
              <div className="metaItem">
                <User size={16} />
                <span>{assignment.members?.length || 0} members</span>
              </div>
              <div className="metaItem">
                <BarChart size={16} />
                <span>
                  {tasks.length} tasks ({tasks.filter((t) => t.completed).length} completed)
                </span>
              </div>
            </div>
          </div>
          <ProgressCircle percentage={progress} />

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
          <button className="closeButton" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="expandedViewBody">
          <div className="descriptionSection">
            <div className="sectionHeader">
              <h3 className="sectionTitle">Description</h3>
              <button className="editButton" onClick={() => setIsEditingDescription(!isEditingDescription)}>
                <Edit size={16} />
              </button>
            </div>

            {isEditingDescription ? (
              <div className="editDescriptionContainer">
                <textarea
                  className="descriptionTextarea"
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  rows={4}
                />
                <div className="editActions">
                  <button className="cancelEditButton" onClick={() => setIsEditingDescription(false)}>
                    Cancel
                  </button>
                  <button className="saveEditButton" onClick={handleSaveDescription}>
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <p className="descriptionText">{assignment.description}</p>
            )}
          </div>

          {assignment.files && assignment.files.length > 0 && (
            <div className="filesSection">
              <div className="sectionHeader">
                <h3 className="sectionTitle">Files</h3>
                <button className="toggleFilesButton" onClick={() => setShowFiles(!showFiles)}>
                  {showFiles ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>
              </div>

              {showFiles && (
                <div className="filesContainer">
                  {assignment.files && assignment.files.length > 0
                    ? assignment.files.map((file: string, index: number) => (
                        <div key={index} className="fileItem">
                          <FileText size={16} />
                          <span className="fileName">{file}</span>
                        </div>
                      ))
                    : null}

                  {assignment.links && assignment.links.length > 0
                    ? assignment.links.map((link: { url: string; title: string }, index: number) => (
                        <div key={`link-${index}`} className="fileItem linkItem">
                          <Link size={16} />
                          <a href={link.url} target="_blank" rel="noopener noreferrer" className="fileName linkName">
                            {link.title}
                          </a>
                        </div>
                      ))
                    : null}

                  {(!assignment.files || assignment.files.length === 0) &&
                    (!assignment.links || assignment.links.length === 0) && (
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
          )}

          <div className="toolbarContainer">
            <div className="viewToggle">
              <button
                className={`viewToggleButton ${viewMode === "status" ? "active" : ""}`}
                onClick={() => setViewMode("status")}
              >
                <LayoutGrid size={18} />
                <span>Status View</span>
              </button>
              <button
                className={`viewToggleButton ${viewMode === "member" ? "active" : ""}`}
                onClick={() => setViewMode("member")}
              >
                <Users size={18} />
                <span>Member View</span>
              </button>
            </div>

            <div className="viewDescription">
              {viewMode === "status" ? (
                <p>Organize tasks by their current status</p>
              ) : (
                <p>View tasks assigned to each team member</p>
              )}
            </div>

            <div className="taskActions">
              <div className="filterContainer" ref={filterMenuRef}>
                <button className="actionButton" onClick={toggleFilterMenu}>
                  <Filter size={18} />
                  <span>Filter</span>
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
                      <h4>Due Date</h4>
                      <div className="filterOptions">
                        <label className="filterOption">
                          <input
                            type="radio"
                            name="dueDate"
                            checked={filters.dueDate === "all"}
                            onChange={() => handleFilterChange("dueDate", "all")}
                          />
                          <span>All</span>
                        </label>
                        <label className="filterOption">
                          <input
                            type="radio"
                            name="dueDate"
                            checked={filters.dueDate === "today"}
                            onChange={() => handleFilterChange("dueDate", "today")}
                          />
                          <span>Today</span>
                        </label>
                        <label className="filterOption">
                          <input
                            type="radio"
                            name="dueDate"
                            checked={filters.dueDate === "week"}
                            onChange={() => handleFilterChange("dueDate", "week")}
                          />
                          <span>This Week</span>
                        </label>
                        <label className="filterOption">
                          <input
                            type="radio"
                            name="dueDate"
                            checked={filters.dueDate === "month"}
                            onChange={() => handleFilterChange("dueDate", "month")}
                          />
                          <span>This Month</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="sortContainer" ref={sortMenuRef}>
                <button className="actionButton" onClick={toggleSortMenu}>
                  {sortDirection === "asc" ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
                  <span>Sort</span>
                </button>

                {isSortMenuOpen && (
                  <div className="sortMenu">
                    <button
                      className={`sortOption ${sortBy === "dueDate" ? "active" : ""}`}
                      onClick={() => handleSortChange("dueDate")}
                    >
                      <Calendar size={16} />
                      <span>Due Date</span>
                      {sortBy === "dueDate" &&
                        (sortDirection === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />)}
                    </button>
                    <button
                      className={`sortOption ${sortBy === "weight" ? "active" : ""}`}
                      onClick={() => handleSortChange("weight")}
                    >
                      <BarChart size={16} />
                      <span>Weight</span>
                      {sortBy === "weight" &&
                        (sortDirection === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />)}
                    </button>
                    <button
                      className={`sortOption ${sortBy === "priority" ? "active" : ""}`}
                      onClick={() => handleSortChange("priority")}
                    >
                      <Flag size={16} />
                      <span>Priority</span>
                      {sortBy === "priority" &&
                        (sortDirection === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />)}
                    </button>
                  </div>
                )}
              </div>

              <button className="createTaskButton" onClick={() => setIsCreateTaskModalOpen(true)}>
                <Plus size={18} />
                <span>New Task</span>
              </button>
            </div>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            {viewMode === "status" ? renderStatusView() : renderMemberView()}
          </DragDropContext>
        </div>
      </div>

      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        onSave={handleCreateTask}
        members={assignment.members || []}
        maxWeight={assignment.weight || 100}
        currentWeight={tasks.reduce((sum, task) => sum + task.weight, 0)}
      />
    </div>
  )
}

export default ExpandedAssignmentView
