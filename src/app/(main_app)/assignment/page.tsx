"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import "./assignment.css"
import { isLate } from "@/lib/utils"
import AssignmentRow from "@/components/assignment/AssignmentRow"
import AssignmentCard from "@/components/assignment/AssignmentCard"
import AssignmentModal from "@/components/assignment/AssignmentModal"
import CreateAssignmentModal from "@/components/assignment/CreateAssignmentModal"
import {
  PlusIcon,
  FilterIcon,
  ArrowUpRightIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CheckSquareIcon,
  ArrowUp,
  ArrowDown,
  Calendar,
  Clock,
} from "lucide-react"
import ProgressCircle from "@/components/assignment/ProgressCircle"
import { None } from "motion/dist/react"
import ViewToggle from "@/components/ViewToggle"

// Define clear interfaces for data models
interface Member {
  id: string
  name: string
  email?: string
  avatar?: string
}

interface FileAttachment {
  id: string
  name: string
  size: number
  type: string
  url?: string
  uploadedAt: string
}

interface Task {
  id: string
  title: string
  description?: string
  status: "unassigned" | "todo" | "inProgress" | "completed"
  priority: "low" | "medium" | "high"
  assigneeId?: string
  dueDate?: string
  weight: number
  createdAt: string
  updatedAt?: string
  expanded?: boolean
}

// Define interface for an assignment from the API
interface AssignmentData {
  id: string
  title: string
  description: string
  createdAt: string
  dueDate: string
  weight: number
  members: Member[]
  tasks: Task[]
  files: FileAttachment[]
}

// Define interface for assignment view model (for display)
interface AssignmentViewModel {
  id: string
  title: string
  date: string
  dueDate: string
  weight: number
  description: string
  progress: number
  daysRemaining: number
  isLate: boolean
  bgColor?: string
  tasks: Task[]
  members: Member[]
  files: FileAttachment[]
  todos?: any[] // For backwards compatibility with AssignmentModal
}

// Type for sorting options
type SortOption = "dueDate" | "createdAt"
type SortDirection = "asc" | "desc"

// View mode type
type ViewMode = "kanban" | "list"

// Define sort function outside the component to avoid hoisting issues
function sortAssignmentsList(
  assignmentList: AssignmentData[],
  sortType: SortOption,
  sortDir: SortDirection
): AssignmentData[] {
  return [...assignmentList].sort((a, b) => {
    if (sortType === "dueDate") {
      const dateA = new Date(a.dueDate).getTime()
      const dateB = new Date(b.dueDate).getTime()
      return sortDir === "asc" ? dateA - dateB : dateB - dateA
    } else {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return sortDir === "asc" ? dateA - dateB : dateB - dateA
    }
  })
}

export default function Assignments() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<ViewMode>("kanban")
  const [expandedAssignment, setExpandedAssignment] = useState<string | null>(null)
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentViewModel | null>(null)
  const [selectedAssignmentData, setSelectedAssignmentData] = useState<AssignmentData | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [assignments, setAssignments] = useState<AssignmentData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortMenuOpen, setSortMenuOpen] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>("dueDate")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

  const switchViewMode = () => {
    if (viewMode == "kanban")
    {setViewMode("list");}
    else
    {setViewMode("kanban");}

  };
  /**
   * Sample data generator function
   * 
   * This provides mock data for development.
   * The structure matches what we expect from the backend API.
   */
  const getSampleAssignments = useCallback((): AssignmentData[] => {
    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    
    const nextWeek = new Date(now)
    nextWeek.setDate(nextWeek.getDate() + 7)
    
    const lastWeek = new Date(now)
    lastWeek.setDate(lastWeek.getDate() - 7)
    
    const members: Member[] = [
      { id: "m1", name: "John Doe", avatar: "/avatars/john.jpg" },
      { id: "m2", name: "Jane Smith", avatar: "/avatars/jane.jpg" },
      { id: "m3", name: "Alex Johnson", avatar: "/avatars/alex.jpg" },
    ]
    
    const files: FileAttachment[] = [
      { 
        id: "f1", 
        name: "Research_Notes.pdf", 
        size: 2500000, 
        type: "application/pdf", 
        uploadedAt: lastWeek.toISOString() 
      },
      { 
        id: "f2", 
        name: "Assignment_Requirements.docx", 
        size: 1200000, 
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", 
        uploadedAt: lastWeek.toISOString() 
      },
    ]
    
    const tasks: Task[] = [
      {
        id: "t1",
        title: "Research topic",
        description: "Gather information from reliable sources",
        status: "todo",
        priority: "high",
        weight: 2,
        assigneeId: "m1",
        dueDate: nextWeek.toISOString(),
        createdAt: lastWeek.toISOString(),
      },
      {
        id: "t2",
        title: "Create outline",
        description: "Structure the document with main points",
        status: "completed",
        priority: "medium",
        weight: 1,
        assigneeId: "m2",
        dueDate: yesterday.toISOString(),
        createdAt: lastWeek.toISOString(),
        expanded: true,
      },
      {
        id: "t3",
        title: "Write introduction",
        description: "Provide context and thesis statement",
        status: "inProgress",
        priority: "medium",
        weight: 3,
        assigneeId: "m1",
        dueDate: nextWeek.toISOString(),
        createdAt: lastWeek.toISOString(),
      },
    ]
    
    return [
      {
        id: "a1",
        title: "Research Paper on Climate Change",
        description: "A comprehensive analysis of climate change factors and their global impact.",
        createdAt: lastWeek.toISOString(),
        dueDate: yesterday.toISOString(),
        weight: 40,
        members: members,
        tasks: tasks,
        files: files,
      },
      {
        id: "a2",
        title: "Literature Review",
        description: "Review of major works in the field with critical analysis.",
        createdAt: lastWeek.toISOString(),
        dueDate: nextWeek.toISOString(),
        weight: 30,
        members: [members[0], members[1]],
        tasks: tasks.slice(0, 2),
        files: files.slice(0, 1),
      },
      {
        id: "a3",
        title: "Group Presentation",
        description: "Prepare slides and talking points for the final presentation.",
        createdAt: lastWeek.toISOString(),
        dueDate: nextWeek.toISOString(),
        weight: 25,
        members: [members[2]],
        tasks: [tasks[0]],
        files: [],
      },
      {
        id: "a4",
        title: "Final Project Report",
        description: "Comprehensive documentation of the project results.",
        createdAt: lastWeek.toISOString(),
        dueDate: lastWeek.toISOString(),
        weight: 50,
        members: members,
        tasks: tasks.map(task => ({ ...task, status: "completed" })),
        files: files,
      },
    ]
  }, [])
  

  /**
   * Utility function to calculate days remaining -
   */
  const calculateDaysRemaining = useCallback((dueDate: string): number => {
    const dueDateTime = new Date(dueDate).getTime()
    const currentTime = new Date().getTime()
    return Math.ceil((dueDateTime - currentTime) / (1000 * 60 * 60 * 24))
  }, [])

  /**
   * Utility function to calculate progress
   */
  const calculateProgress = useCallback((tasks: Task[]): number => {
    if (tasks.length === 0) return 0
    
    const totalWeight = tasks.reduce((sum, task) => sum + task.weight, 0)
    if (totalWeight === 0) return 0
    
    const completedWeight = tasks
      .filter(task => task.status === "completed")
      .reduce((sum, task) => sum + task.weight, 0)
    
    return Math.round((completedWeight / totalWeight) * 100)
  }, [])

  /**
   * Utility function to format date for display
   */
  const formatDate = useCallback((dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }, [])

  /**
   * Get background color for assignment card
   */
  const getCardBgColor = useCallback((assignment: AssignmentData): string => {
    const progress = calculateProgress(assignment.tasks)
    
    if (progress === 100) {
      return "#647A67" // Green color for completed items
    }
    
    if (isLate(assignment.dueDate)) {
      return "#900100" // Red color for late assignments
    }
    
    return "#DD992B" // Default gold color for active
  }, [calculateProgress, isLate])

  /**
   * Create view model for assignment card display
   */
  const createAssignmentViewModel = useCallback((assignment: AssignmentData): AssignmentViewModel => {
    const progress = calculateProgress(assignment.tasks)
    const daysRemaining = calculateDaysRemaining(assignment.dueDate)
    
    // Create a string[] for todos to ensure we pass strings, not objects
    const todos = assignment.tasks.map(task => ({
      id: task.id,
      text: task.title,
      description: task.description,
      completed: task.status === "completed",
      expanded: task.expanded,
      assignee: task.assigneeId,
      dueDate: task.dueDate ? formatDate(task.dueDate) : undefined, 
      weight: task.weight,
      priority: task.priority,
      status: task.status
    }))
    
    return {
      id: assignment.id,
      title: assignment.title,
      date: formatDate(assignment.createdAt),
      dueDate: formatDate(assignment.dueDate),
      weight: assignment.weight,
      description: assignment.description,
      progress,
      daysRemaining,
      isLate: isLate(assignment.dueDate),
      bgColor: getCardBgColor(assignment),
      tasks: assignment.tasks,
      members: assignment.members,
      files: assignment.files,
      todos // For backwards compatibility with AssignmentModal
    }
  }, [calculateProgress, calculateDaysRemaining, formatDate, isLate, getCardBgColor])

  /**
   * Load all assignments on component mount
   */
  useEffect(() => {
    // Only load data if we haven't already
    if (assignments.length === 0) {
      setIsLoading(true)
      
      // Timeout to simulate network request
      const timer = setTimeout(() => {
        try {
          // Load mock data
          const data = getSampleAssignments()
          setAssignments(data)
          setError(null)
        } catch (err) {
          console.error("Error loading assignments:", err)
          setError("Failed to load assignments. Please try again.")
        } finally {
          setIsLoading(false)
        }
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [assignments.length, getSampleAssignments])

  /**
   * Get active assignments with memoization
   */
  const activeAssignments = useMemo(() => {
    const filtered = assignments.filter(assignment => calculateProgress(assignment.tasks) < 100)
    return sortAssignmentsList(filtered, sortBy, sortDirection)
  }, [assignments, calculateProgress, sortBy, sortDirection])

  /**
   * Get completed assignments with memoization
   */
  const completedAssignments = useMemo(() => {
    const filtered = assignments.filter(assignment => calculateProgress(assignment.tasks) === 100)
    return sortAssignmentsList(filtered, sortBy, sortDirection)
  }, [assignments, calculateProgress, sortBy, sortDirection])

  /**
   * Handle sort change
   */
  const handleSortChange = useCallback((sortType: SortOption) => {
    if (sortBy === sortType) {
      // Toggle direction if same sort type
      setSortDirection(prevDirection => prevDirection === "asc" ? "desc" : "asc")
    } else {
      setSortBy(sortType)
      setSortDirection("asc")
    }
    setSortMenuOpen(false)
  }, [sortBy])

  /**
   * Handle assignment click in list view
   */
  const handleAssignmentClick = useCallback((id: string) => {
    if (viewMode === "list") {
      setExpandedAssignment(prevId => prevId === id ? null : id)
    }
  }, [viewMode])

  /**
   * Handle assignment card click
   */
  const handleCardClick = useCallback((assignment: AssignmentData) => {
    const viewModel = createAssignmentViewModel(assignment)
    setSelectedAssignmentData(assignment)
    setSelectedAssignment(viewModel)
    setIsModalOpen(true)
  }, [createAssignmentViewModel])

  /**
   * Handle closing assignment modal
   */
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    // Use a timeout to prevent memory issues with large objects
    setTimeout(() => {
      setSelectedAssignment(null)
      setSelectedAssignmentData(null)
    }, 300)
  }, [])

  /**
   * Handle toggling task completion status
   */
  const handleTaskToggle = useCallback((taskId: string) => {
    if (!selectedAssignmentData) return

    setSelectedAssignmentData(prevData => {
      if (!prevData) return null
      
      // Find the task to toggle
      const task = prevData.tasks.find(t => t.id === taskId)
      if (!task) return prevData

      // Toggle the task status with proper typing
      const newStatus: "unassigned" | "todo" | "inProgress" | "completed" = 
        task.status === "completed" ? "inProgress" : "completed"
      
      // Update tasks array with explicit type
      const updatedTasks: Task[] = prevData.tasks.map(t => 
        t.id === taskId 
          ? {
              ...t,
              status: newStatus,
              updatedAt: new Date().toISOString()
            } 
          : t
      )

      // Create updated assignment object
      const updatedAssignment: AssignmentData = {
        ...prevData,
        tasks: updatedTasks
      }

      // Also update the assignments list
      setAssignments(prev => 
        prev.map(a => a.id === updatedAssignment.id ? updatedAssignment : a)
      )

      // Update selected assignment view model too
      setSelectedAssignment(prev => 
        prev ? createAssignmentViewModel(updatedAssignment) : null
      )

      return updatedAssignment
    })
  }, [selectedAssignmentData, createAssignmentViewModel])

  /**
   * Handle expanding task details
   */
  const handleTaskExpand = useCallback((taskId: string) => {
    if (!selectedAssignmentData) return

    setSelectedAssignmentData(prevData => {
      if (!prevData) return null
      
      const updatedTasks: Task[] = prevData.tasks.map(task => 
        task.id === taskId 
          ? { ...task, expanded: !task.expanded } 
          : task
      )

      const updatedAssignment: AssignmentData = {
        ...prevData,
        tasks: updatedTasks,
      }

      setSelectedAssignment(prev => 
        prev ? createAssignmentViewModel(updatedAssignment) : null
      )

      return updatedAssignment
    })
  }, [selectedAssignmentData, createAssignmentViewModel])

  /**
   * Stable empty function for onAddTodo to prevent re-renders
   */
  const handleAddTodo = useCallback(() => {
    // Will be implemented later
    console.log("Add todo clicked")
  }, [])

  /**
   * Handle creating new assignment
   */
  const handleCreateAssignment = useCallback((newAssignmentData: any) => {
    // Generate a mock ID for the new assignment
    const id = `a${Date.now()}`
    
    // Create the assignment with the ID
    const createdAssignment: AssignmentData = {
      id,
      title: newAssignmentData.title || '',
      description: newAssignmentData.description || '',
      createdAt: newAssignmentData.createdAt || new Date().toISOString(),
      dueDate: newAssignmentData.dueDate || new Date().toISOString(),
      weight: newAssignmentData.weight || 0,
      members: newAssignmentData.members || [],
      tasks: newAssignmentData.tasks || [],
      files: newAssignmentData.files || []
    }
    
    // Update local state
    setAssignments(prev => [...prev, createdAssignment])
    setIsCreateModalOpen(false)
  }, [])

  /**
   * Handle updating assignment
   */
  const handleUpdateAssignment = useCallback((updatedAssignment: AssignmentData) => {
    // Update local state
    setAssignments(prev => 
      prev.map(assignment => assignment.id === updatedAssignment.id ? updatedAssignment : assignment)
    )
    
    // Update selected assignment if it's the one being edited
    if (selectedAssignmentData?.id === updatedAssignment.id) {
      setSelectedAssignmentData(updatedAssignment)
      setSelectedAssignment(createAssignmentViewModel(updatedAssignment))
    }
  }, [selectedAssignmentData, createAssignmentViewModel])

  // Rows data for rendering
  const rows = useMemo(() => [
    {
      id: "active",
      title: "Active",
      assignments: activeAssignments,
      color: "#DD992B", // Gold color
    },
    {
      id: "completed",
      title: "Completed",
      assignments: completedAssignments,
      color: "#647A67", // Green color for completed items
    },
  ], [activeAssignments, completedAssignments])

  if (isLoading) {
    return (
      <div className="loadingContainer">
        <div className="loadingSpinner"></div>
        <p>Loading assignments...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="errorContainer">
        <div className="errorIcon">!</div>
        <h2>Error Loading Assignments</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    )
  }

  return (
    <div className="assignmentsContainer">
      <header className="assignmentHeader">
        <h1 className="title">Assignments</h1>
        <div className="actions">
          <div className="sortDropdown">
            <button className="iconButton" onClick={() => setSortMenuOpen(!sortMenuOpen)}>
              <ArrowUpRightIcon size={20} />
            </button>
            {/* Sort menu */}
            {sortMenuOpen && (
              <div className="sortMenu">
                <button
                  className={`sortOption ${sortBy === "dueDate" ? "active" : ""}`}
                  onClick={() => handleSortChange("dueDate")}
                >
                  <Calendar size={16} />
                  <span>Due Date</span>
                  {sortBy === "dueDate" && (sortDirection === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />)}
                </button>
                <button
                  className={`sortOption ${sortBy === "createdAt" ? "active" : ""}`}
                  onClick={() => handleSortChange("createdAt")}
                >
                  <Clock size={16} />
                  <span>Created Date</span>
                  {sortBy === "createdAt" &&
                    (sortDirection === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />)}
                </button>
              </div>
            )}
          </div>

          <ViewToggle viewMode={viewMode} onclick={switchViewMode} />

        </div>
      </header>

      {viewMode === "kanban" ? (
        // Kanban View
        <div className="rowsContainer">
          {rows.map((row) => (
            <AssignmentRow key={row.id} title={row.title} color={row.color}>
              {row.assignments.map((assignment) => {
                const viewModel = createAssignmentViewModel(assignment)
                return (
                  <div key={assignment.id} onClick={() => handleCardClick(assignment)}>
                    <AssignmentCard
                      title={viewModel.title}
                      date={viewModel.date}
                      dueDate={viewModel.dueDate}
                      weight={viewModel.weight}
                      description={viewModel.description}
                      progress={viewModel.progress}
                      daysRemaining={viewModel.daysRemaining}
                      isLate={viewModel.isLate}
                      bgColor={viewModel.bgColor}
                      width="230px"
                      height="180px"
                    />
                  </div>
                )
              })}
              <div className="addCard" onClick={() => setIsCreateModalOpen(true)}>
                <PlusIcon size={24} />
                <span>Add Assignment</span>
              </div>
            </AssignmentRow>
          ))}
        </div>
      ) : (
        // List View
        <div className="listContainer">
          {rows.map((row) => (
            <div key={row.id} className="listSection">
              <div className="listSectionHeader" style={{ backgroundColor: row.color }}>
                <h2 className="listSectionTitle">{row.title}</h2>
              </div>
              <div className="listItems">
                {row.assignments.map((assignment) => 
                {
                  const viewModel = createAssignmentViewModel(assignment)
                  return (
                    <div key={assignment.id}>
                      <div
                        className={`listItem ${expandedAssignment === assignment.id ? "expanded" : ""}`}
                        style={{ backgroundColor: viewModel.bgColor }}
                        onClick={() => handleAssignmentClick(assignment.id)}
                      >
                        <div className="listItemIcon">
                          {expandedAssignment === assignment.id ? (
                            <ChevronDownIcon size={20} />
                          ) : (
                            <ChevronRightIcon size={20} />
                          )}
                        </div>
                        <div className="listItemContent">
                          <h3 className="listItemTitle">{viewModel.title}</h3>
                          <div className="listItemMeta">
                            <span>
                              {viewModel.date} + day due | weightage {viewModel.weight}%
                            </span>
                          </div>
                        </div>
                        <ProgressCircle percentage={viewModel.progress} />
                      </div>

                      {expandedAssignment === assignment.id && (
                        <div className="listItemDetails" style={{ backgroundColor: viewModel.bgColor }}>
                          <div className="listItemDescription">
                            <p>{viewModel.description}</p>
                          </div>
                          <div className="todoItems">
                            <div className="todoItemHeader">
                              <FilterIcon size={16} />
                              <ArrowUpRightIcon size={16} />
                            </div>
                            {assignment.tasks && assignment.tasks.length > 0 ? (
                              assignment.tasks.map((task) => (
                                <div key={task.id} className="todoItem">
                                  <div className="todoItemCheckbox">
                                    <CheckSquareIcon size={20} />
                                  </div>
                                  <span className="todoItemText">{task.title}</span>
                                  <div className="todoItemProgressBars">
                                    <div className="miniProgressBar"></div>
                                    <div className="miniProgressBar"></div>
                                    <div className="miniProgressBar"></div>
                                  </div>
                                  <div className="todoItemAvatar"></div>
                                </div>
                              ))
                            ) : (
                              <div className="emptyTodoState">
                                <p>No tasks added yet</p>
                              </div>
                            )}
                            <div className="todoItem">
                              <div className="addTodoButton" onClick={() => handleCardClick(assignment)}>
                                <PlusIcon size={18} />
                                <span>Add New Task</span>
                              </div>
                            </div>
                          </div>
                          <div className="detailsFooter">
                            <button className="viewFullButton" onClick={() => handleCardClick(assignment)}>
                              View Full Details
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
                <div className="addListItem" onClick={() => setIsCreateModalOpen(true)}>
                  <PlusIcon size={20} />
                  <span>Add New Assignment</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="floatingAddButton" onClick={() => setIsCreateModalOpen(true)}>
        <PlusIcon size={24} />
      </button>

      {selectedAssignment && (
        <AssignmentModal
          isOpen={isModalOpen}
          assignment={selectedAssignment}
          onClose={handleCloseModal}
          onTodoToggle={handleTaskToggle}
          onTodoExpand={handleTaskExpand}
          onAddTodo={handleAddTodo}
          onUpdate={handleUpdateAssignment}
        />
      )}

      <CreateAssignmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateAssignment}
      />
    </div>
  )
}