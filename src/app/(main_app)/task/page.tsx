"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Calendar, Clock, Flag, CheckCircle, PlusIcon } from "lucide-react"
import SortMenu from "@/components/common/SortMenu"
import type { Task, TaskStatus } from "@/types/task"
import type { Assignment } from "@/types/assignment"
import type { SortOption, SortDirection, ViewMode } from "@/types/auxilary"
import TaskGroup from "@/components/task/TaskGroup"
import TaskFilterBar from "@/components/task/TaskFilterBar"
import ActionButton from "@/components/common/ActionButton"
import CreateTaskModal from "@/components/task/CreateTaskModal"
import "./task.css"

// Define grouping types
type GroupBy = "assignment" | "priority" | "dueDate"
type FilterStatus = "all" | "active" | "completed" | "To-Do" | "In Progress" | "Completed"

export default function TasksPage() {
  // State for tasks and assignments data
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null)

  // State for view options - removed ViewToggle
  const [viewMode] = useState<ViewMode>({ label: "List" })
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

  // Load assignments data on component mount
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setIsLoading(true)
        const res = await fetch("/api/assignments")
        if (!res.ok) throw new Error("Failed to fetch assignments")

        const data = await res.json()
        setAssignments(data)
        setError(null)
      } catch (err) {
        console.error("Error loading assignments:", err)
        setError("Failed to load tasks. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAssignments()
  }, [])

  // Extract all tasks from assignments with assignment info
  const allTasks = useMemo(() => {
    const tasks: (Task & { assignmentTitle: string; assignmentDeadline: string })[] = []

    assignments.forEach((assignment) => {
      if (Array.isArray(assignment.tasks)) {
        assignment.tasks.forEach((task) => {
          tasks.push({
            ...task,
            assignmentTitle: assignment.title,
            assignmentDeadline: assignment.deadline,
          })
        })
      }
    })

    return tasks
  }, [assignments])

  // Filter tasks based on status
  const filteredTasks = useMemo(() => {
    if (filterStatus === "all") {
      return allTasks
    } else if (filterStatus === "active") {
      return allTasks.filter((task) => task.status !== "Completed")
    } else if (filterStatus === "completed") {
      return allTasks.filter((task) => task.status === "Completed")
    } else {
      // Filter by specific status
      return allTasks.filter((task) => task.status === filterStatus)
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
    const groups: Record<string, (Task & { assignmentTitle: string; assignmentDeadline: string })[]> = {}

    if (groupBy === "assignment") {
      // Group by assignment title
      sortedTasks.forEach((task) => {
        const key = task.assignmentTitle || "Unassigned"
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
      setSortMenuOpen(false)
    },
    [sortBy],
  )

  // Find assignment by task
  const findAssignmentByTask = useCallback(
    (taskId: string) => {
      for (const assignment of assignments) {
        const task = assignment.tasks.find((t) => t.id === taskId)
        if (task) {
          return assignment
        }
      }
      return null
    },
    [assignments],
  )

  // const updateTask = useCallback(
  //   (taskId: string, updates: Partial<Task>) => {
  //     if (!selectedAssignmentData) {
  //       return
  //     }

  //     setSelectedAssignmentData((prevData) => {
  //       if (!prevData) return null

  //       const taskExists = prevData.tasks.some((t) => t.id === taskId)
  //       if (!taskExists) return prevData

  //       //NOTE: Can probs just update the task itself with partials, rather than update via updating assignment lol
  //       const updatedTasks: Task[] = prevData.tasks.map((t) =>
  //         t.id === taskId
  //           ? {
  //               ...t,
  //               ...updates,
  //             }
  //           : t,
  //       )

  //       const updatedAssignment: Assignment = {
  //         ...prevData,
  //         tasks: updatedTasks,
  //       }

  //       setAssignments((prev) => prev.map((a) => (a.id === updatedAssignment.id ? updatedAssignment : a)))

  //       return updatedAssignment
  //     })
  //   },
  //   [selectedAssignmentData],
  // )

  const deleteTask = useCallback(
    async (taskId: string) => {

      try {
        // Find the assignment containing this task
        const assignment = findAssignmentByTask(taskId)
        if (!assignment) return

        // Prepare the update data
        const updatedTasks = assignment.tasks.filter((t) => t.id !== taskId)

                // Update the local state
                setAssignments((prevAssignments) => {
                  return prevAssignments.map((a) => {
                    if (a.id === assignment.id) {
                      return { ...a, tasks: updatedTasks }
                    }
                    return a
                  })
                })
        

        // Send the update to the API
        const res = await fetch(`/api/tasks/${taskId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedTasks),
        })

        if (!res.ok) throw new Error("Failed to update task status")

      } catch (err) {
        console.error("Error updating task status:", err)
        // Optionally show an error toast/notification here
      }
    }

  ,[findAssignmentByTask])

  // Handle task status change
  const handleTaskStatusChange = useCallback(
    async (taskId: string, newStatus: TaskStatus) => {
      try {
        // Find the assignment containing this task
        const assignment = findAssignmentByTask(taskId)
        if (!assignment) return

        // Prepare the update data
        const updateData = {
          status: newStatus,
        }
        // Update the local state before db
        setAssignments((prevAssignments) => {
          return prevAssignments.map((a) => {
            if (a.id === assignment.id) {
              const updatedTasks = a.tasks.map((t) => {
                if (t.id === taskId) {
                  return { ...t, status: newStatus }
                }
                return t
              })
              return { ...a, tasks: updatedTasks }
            }
            return a
          })
        })
        // Send the update to the API
        const res = await fetch(`/api/tasks/${taskId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        })

        if (!res.ok) throw new Error("Failed to update task status")


      } catch (err) {
        console.error("Error updating task status:", err)
        // Optionally show an error toast/notification here
      }
    },
    [findAssignmentByTask],
  )

  // Handle group by change
  const handleGroupByChange = useCallback((newGroupBy: GroupBy) => {
    setGroupBy(newGroupBy)
  }, [])

  // Handle filter status change
  const handleFilterStatusChange = useCallback((newStatus: FilterStatus) => {
    setFilterStatus(newStatus)
  }, [])

  // Handle creating a new task
  const handleCreateTask = useCallback(
    async (newTaskData: any) => {
      setIsCreateModalOpen(false)
      try {
        if (!newTaskData.assignmentId && selectedAssignmentId) {
          newTaskData.assignmentId = selectedAssignmentId
        }

        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: newTaskData.title,
            description: newTaskData.description,
            status: newTaskData.status,
            priority: newTaskData.priority,
            deadline: newTaskData.deadline,
            assignmentId: newTaskData.assignmentId || selectedAssignmentId,
          }),
        })

        if (!res.ok) throw new Error("Failed to create task")

        const createdTask = await res.json()

        // Update the local state
        setAssignments((prevAssignments) => {
          return prevAssignments.map((assignment) => {
            if (assignment.id === createdTask.assignment.id) {
              return {
                ...assignment,
                tasks: [...assignment.tasks, createdTask],
              }
            }
            return assignment
          })
        })

        setIsCreateModalOpen(false)
      } catch (err) {
        console.error("Error creating task:", err)
        // Optionally show an error toast/notification here
      }
    },
    [selectedAssignmentId],
  )

  // Handle opening the create task modal for a specific assignment
  const handleOpenCreateTaskModal = useCallback(
    (assignmentTitle: string) => {
      // Find the assignment by title
      const assignment = assignments.find((a) => a.title === assignmentTitle)
      if (assignment) {
        setSelectedAssignmentId(assignment.id)
        setIsCreateModalOpen(true)
      }
    },
    [assignments],
  )

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

  // Empty state
  if (allTasks.length == 0) {
    return (
      <><div className="loadingContainer">
        <p>No tasks found...</p>
        <p>Time to create your first task!</p>
        <div className="addCard" onClick={() => setIsCreateModalOpen(true)}>
          <PlusIcon size={24} />
          <span>Add Task</span>
        </div>
      </div><CreateTaskModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false)
            setSelectedAssignmentId(null)
          } }
          onSave={handleCreateTask}
          members={[]}
          maxWeight={100}
          task={null} /></>
        )
    
  }

  return (
    <div>
      <header className="assignmentHeader">
        <h1 className="title">My Tasks</h1>
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
          {/* Removed ViewToggle component */}
        </div>
      </div>

      {/* Added divider line */}
      <div className="filterDividerLine"></div>

      <div className="assignmentsContainer">
        <div className="tasksContent listView">
          {Object.entries(groupedTasks).length > 0 ? (
            Object.entries(groupedTasks).map(([groupName, tasks]) => {
              // Get the assignment deadline for color if grouping by assignment
              const assignmentDeadline = groupBy === "assignment" && tasks.length > 0 ? tasks[0].assignmentDeadline : ""

              return (
                <TaskGroup
                  key={groupName}
                  title={groupName}
                  tasks={tasks}
                  viewMode="list"
                  onStatusChange={handleTaskStatusChange}
                  onTaskDelete={deleteTask}
                  onCreateTask={groupBy === "assignment" ? () => handleOpenCreateTaskModal(groupName) : undefined}
                  assignmentDeadline={assignmentDeadline}
                />
              )
            })
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

      <ActionButton
        icon={<PlusIcon size={24} />}
        onclick={() => setIsCreateModalOpen(true)}
        tooltip="Create a New Task"
      />

      {/* Create Task Modal */}
      {isCreateModalOpen && (
        <CreateTaskModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false)
            setSelectedAssignmentId(null)
          }}
          onSave={handleCreateTask}
          members={[]}
          maxWeight={100}
          currentWeight={0}
          task={null}
        />
      )}
    </div>
  )
}
