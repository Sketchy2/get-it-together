"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Calendar, Clock, Flag, CheckCircle, Layers, AlertTriangle, CheckSquare } from "lucide-react"
import SortMenu from "@/components/SortMenu"
import ViewToggle from "@/components/ViewToggle"
import type { Task, TaskStatus } from "@/types/task"
import type { Assignment } from "@/types/assignment"
import type { SortOption, SortDirection } from "@/types/sort"
import TaskGroup from "@/components/task/TaskGroup"
import TaskFilterBar from "@/components/task/TaskFilterBar"
import "./task.css"

// Sample data generator function (would be replaced with API calls in production)
const getSampleData = (): { assignments: Assignment[] } => {
  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)

  const nextWeek = new Date(now)
  nextWeek.setDate(nextWeek.getDate() + 7)

  const lastWeek = new Date(now)
  lastWeek.setDate(lastWeek.getDate() - 7)

  const assignments: Assignment[] = [
    {
      id: "a1",
      title: "Research Paper on Climate Change",
      description: "A comprehensive analysis of climate change factors and their global impact.",
      createdAt: lastWeek.toISOString(),
      deadline: yesterday.toISOString(),
      weighting: 40,
      members: [{ id: "m1", name: "John Doe" }],
      tasks: [
        {
          id: "t1",
          title: "Research topic",
          description: "Gather information from reliable sources",
          status: "To-Do",
          priority: "high",
          weight: 2,
          assignee: "John Doe",
          deadline: nextWeek.toISOString(),
          createdAt: lastWeek.toISOString(),
        },
        {
          id: "t2",
          title: "Create outline",
          description: "Structure the document with main points",
          status: "Completed",
          priority: "medium",
          weight: 1,
          assignee: "John Doe",
          deadline: yesterday.toISOString(),
          createdAt: lastWeek.toISOString(),
        },
      ],
      files: [],
      links: [],
    },
    {
      id: "a2",
      title: "Literature Review",
      description: "Review of major works in the field with critical analysis.",
      createdAt: lastWeek.toISOString(),
      deadline: nextWeek.toISOString(),
      weighting: 30,
      members: [{ id: "m1", name: "John Doe" }],
      tasks: [
        {
          id: "t3",
          title: "Write introduction",
          description: "Provide context and thesis statement",
          status: "In Progress",
          priority: "medium",
          weight: 3,
          assignee: "John Doe",
          deadline: nextWeek.toISOString(),
          createdAt: lastWeek.toISOString(),
        },
        {
          id: "t4",
          title: "Analyze key papers",
          description: "Critical analysis of 5 key papers in the field",
          status: "To-Do",
          priority: "high",
          weight: 2,
          assignee: "John Doe",
          deadline: nextWeek.toISOString(),
          createdAt: lastWeek.toISOString(),
        },
      ],
      files: [],
      links: [],
    },
    {
      id: "a3",
      title: "Group Presentation",
      description: "Prepare slides and talking points for the final presentation.",
      createdAt: lastWeek.toISOString(),
      deadline: nextWeek.toISOString(),
      weighting: 25,
      members: [{ id: "m1", name: "John Doe" }],
      tasks: [
        {
          id: "t5",
          title: "Create slides",
          description: "Design presentation slides with key points",
          status: "To-Do",
          priority: "low",
          weight: 1,
          assignee: "John Doe",
          deadline: nextWeek.toISOString(),
          createdAt: lastWeek.toISOString(),
        },
      ],
      files: [],
      links: [],
    },
  ]

  return { assignments }
}

// Define grouping types
type GroupBy = "assignment" | "priority" | "dueDate"
type FilterStatus = "all" | "active" | "completed"

export default function TasksPage() {
  // State for tasks data
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State for view options
  const [viewMode, setViewMode] = useState<"kanban" | "list">("list")
  const [groupBy, setGroupBy] = useState<GroupBy>("assignment")
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all")
  const [sortMenuOpen, setSortMenuOpen] = useState(false)

  // Sort options
  const sortOptions: SortOption[] = [
    { key: "deadline", label: "Deadline", icon: <Calendar size={16} /> },
    { key: "priority", label: "Priority", icon: <Flag size={16} /> },
    { key: "createdAt", label: "Created At", icon: <Clock size={16} /> },
  ]
  const [sortBy, setSortBy] = useState<SortOption>(sortOptions[0])
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

  // Load data on component mount
  useEffect(() => {
    setIsLoading(true)

    // Simulate API call with timeout
    const timer = setTimeout(() => {
      try {
        const { assignments } = getSampleData()
        setAssignments(assignments)
        setError(null)
      } catch (err) {
        console.error("Error loading tasks:", err)
        setError("Failed to load tasks. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Extract all tasks assigned to the current user
  const allTasks = useMemo(() => {
    const tasks: (Task & { assignmentId: string; assignmentTitle: string })[] = []

    assignments.forEach((assignment) => {
      assignment.tasks.forEach((task) => {
        // Only include tasks assigned to the current user
        // In a real app, you would check against the logged-in user
        if (task.assignee === "John Doe") {
          tasks.push({
            ...task,
            assignmentId: assignment.id,
            assignmentTitle: assignment.title,
          })
        }
      })
    })

    return tasks
  }, [assignments])

  // Filter tasks based on status
  const filteredTasks = useMemo(() => {
    if (filterStatus === "all") {
      return allTasks
    } else if (filterStatus === "active") {
      return allTasks.filter((task) => task.status !== "Completed")
    } else {
      return allTasks.filter((task) => task.status === "Completed")
    }
  }, [allTasks, filterStatus])

  // Sort tasks based on current sort option
  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      if (sortBy.key === "deadline") {
        if (!a.deadline) return sortDirection === "asc" ? 1 : -1
        if (!b.deadline) return sortDirection === "asc" ? -1 : 1

        const dateA = new Date(a.deadline).getTime()
        const dateB = new Date(b.deadline).getTime()

        return sortDirection === "asc" ? dateA - dateB : dateB - dateA
      } else if (sortBy.key === "priority") {
        const priorityValues = { high: 3, medium: 2, low: 1 }
        const valueA = priorityValues[a.priority || "medium"] || 0
        const valueB = priorityValues[b.priority || "medium"] || 0

        return sortDirection === "asc" ? valueB - valueA : valueA - valueB
      } else if (sortBy.key === "createdAt") {
        if (!a.createdAt) return sortDirection === "asc" ? 1 : -1
        if (!b.createdAt) return sortDirection === "asc" ? -1 : 1

        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()

        return sortDirection === "asc" ? dateA - dateB : dateB - dateA
      }
      return 0
    })
  }, [filteredTasks, sortBy, sortDirection])

  // Group tasks based on grouping option
  const groupedTasks = useMemo(() => {
    const groups: Record<string, (Task & { assignmentId: string; assignmentTitle: string })[]> = {}

    if (groupBy === "assignment") {
      sortedTasks.forEach((task) => {
        const key = task.assignmentTitle
        if (!groups[key]) {
          groups[key] = []
        }
        groups[key].push(task)
      })
    } else if (groupBy === "priority") {
      // Group by priority (high, medium, low)
      sortedTasks.forEach((task) => {
        const key = task.priority || "medium"
        if (!groups[key]) {
          groups[key] = []
        }
        groups[key].push(task)
      })
    } else if (groupBy === "dueDate") {
      // Group by due date (today, this week, next week, later)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const oneWeekLater = new Date(today)
      oneWeekLater.setDate(today.getDate() + 7)

      const twoWeeksLater = new Date(today)
      twoWeeksLater.setDate(today.getDate() + 14)

      sortedTasks.forEach((task) => {
        let key = "No Due Date"

        if (task.deadline) {
          const deadline = new Date(task.deadline)
          deadline.setHours(0, 0, 0, 0)

          if (deadline < today) {
            key = "Overdue"
          } else if (deadline.getTime() === today.getTime()) {
            key = "Today"
          } else if (deadline < oneWeekLater) {
            key = "This Week"
          } else if (deadline < twoWeeksLater) {
            key = "Next Week"
          } else {
            key = "Later"
          }
        }

        if (!groups[key]) {
          groups[key] = []
        }
        groups[key].push(task)
      })
    }

    return groups
  }, [sortedTasks, groupBy])

  // Handle sort change
  const handleSortChange = useCallback(
    (sortOption: SortOption) => {
      if (sortBy.key === sortOption.key) {
        setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
      } else {
        setSortBy(sortOption)
        setSortDirection("asc")
      }
    },
    [sortBy],
  )

  // Handle task status change
  const handleTaskStatusChange = useCallback((taskId: string, newStatus: TaskStatus) => {
    setAssignments((prevAssignments) => {
      return prevAssignments.map((assignment) => {
        const updatedTasks = assignment.tasks.map((task) => {
          if (task.id === taskId) {
            return { ...task, status: newStatus }
          }
          return task
        })

        return { ...assignment, tasks: updatedTasks }
      })
    })
  }, [])

  // Handle view mode toggle
  const handleViewModeToggle = useCallback(() => {
    setViewMode((prev) => (prev === "kanban" ? "list" : "kanban"))
  }, [])

  // Handle group by change
  const handleGroupByChange = useCallback((newGroupBy: GroupBy) => {
    setGroupBy(newGroupBy)
  }, [])

  // Handle filter status change
  const handleFilterStatusChange = useCallback((newStatus: FilterStatus) => {
    setFilterStatus(newStatus)
  }, [])

  // Loading state
  if (isLoading) {
    return (
      <div className="loadingContainer">
        <div className="loadingSpinner"></div>
        <p>Loading tasks...</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="errorContainer">
        <div className="errorIcon">!</div>
        <h2>Error Loading Tasks</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    )
  }

  return (
    <div className="tasksPageContainer">
      <header className="tasksHeader">
        <h1 className="tasksTitle">My Tasks</h1>
        <div className="tasksSummary">
          <div className="tasksSummaryItem">
            <span className="tasksSummaryLabel">Total Tasks</span>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Layers size={24} style={{ opacity: 0.7 }} />
              <span className="tasksSummaryValue">{allTasks.length}</span>
            </div>
          </div>
          <div className="tasksSummaryItem">
            <span className="tasksSummaryLabel">Completed</span>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <CheckSquare size={24} style={{ opacity: 0.7 }} />
              <span className="tasksSummaryValue">{allTasks.filter((task) => task.status === "Completed").length}</span>
            </div>
          </div>
          <div className="tasksSummaryItem">
            <span className="tasksSummaryLabel">Pending</span>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <AlertTriangle size={24} style={{ opacity: 0.7 }} />
              <span className="tasksSummaryValue">{allTasks.filter((task) => task.status !== "Completed").length}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="tasksToolbar">
        <div className="tasksToolbarLeft">
          <TaskFilterBar
            currentFilter={filterStatus}
            onFilterChange={handleFilterStatusChange}
            currentGrouping={groupBy}
            onGroupingChange={handleGroupByChange}
          />
        </div>
        <div className="tasksToolbarRight">
          <SortMenu
            sortMenuOpen={sortMenuOpen}
            setSortMenuOpen={() => setSortMenuOpen(!sortMenuOpen)}
            sortBy={sortBy}
            sortDirection={sortDirection}
            handleSortChange={handleSortChange}
            options={sortOptions}
          />
          <ViewToggle viewMode={viewMode} onclick={handleViewModeToggle} />
        </div>
      </div>

      <div className={`tasksContent ${viewMode === "kanban" ? "kanbanView" : "listView"}`}>
        {Object.entries(groupedTasks).length > 0 ? (
          Object.entries(groupedTasks).map(([groupName, tasks]) => (
            <TaskGroup
              key={groupName}
              title={groupName}
              tasks={tasks}
              viewMode={viewMode}
              onStatusChange={handleTaskStatusChange}
            />
          ))
        ) : (
          <div className="emptyTasksMessage">
            <CheckCircle size={48} />
            <h3>No tasks found</h3>
            <p>
              {filterStatus === "all"
                ? "You don't have any tasks assigned to you yet."
                : filterStatus === "active"
                  ? "You don't have any active tasks."
                  : "You don't have any completed tasks."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
