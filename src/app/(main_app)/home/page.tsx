"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { ChevronLeft, ChevronRight, ClipboardList } from "lucide-react"
import type { Assignment } from "@/types/assignment"
import type { Task, TaskStatus } from "@/types/task"
import { dateFnsLocalizer } from "react-big-calendar"
import {
  format,
  parse,
  startOfWeek,
  getDay,
  addDays,
  addWeeks,
  subWeeks,
  startOfDay,
  endOfDay,
  isSaturday,
  isSunday,
} from "date-fns"
import { enUS } from "date-fns/locale/en-US"
import EventModal from "@/components/calendar/EventModal"
import TaskGroup from "@/components/task/TaskGroup"
import AssignmentOverlay from "@/components/assignment/AssignmentOverlay"
import "./dashboard.css"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { type EventType, EVENT_COLORS } from "@/types/event"

// Update the CustomWeekView component to use the passed navigation functions
const CustomWeekView = ({ date, events, onSelectEvent, onPrevWeek, onNextWeek }: any) => {
  // Get the start of the week (Sunday)
  const weekStart = startOfWeek(date)

  // Create array of days (Sunday to Saturday) - all 7 days
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  // Get current semester week (assuming semester starts on a specific date)
  // For demo purposes, we'll use January 1, 2024 as semester start
  const semesterStart = new Date(2024, 0, 1)
  const currentWeek = Math.ceil((date.getTime() - semesterStart.getTime()) / (7 * 24 * 60 * 60 * 1000))

  return (
    <div className="custom-week-view">
      <div className="week-header">
        <button className="week-nav-button" onClick={onPrevWeek}>
          <ChevronLeft size={20} />
        </button>
        <h3>Week {currentWeek > 0 ? currentWeek : 1}</h3>
        <button className="week-nav-button" onClick={onNextWeek}>
          <ChevronRight size={20} />
        </button>
      </div>
      <div className="days-container">
        {days.map((day) => {
          const dayStart = startOfDay(day)
          const dayEnd = endOfDay(day)
          const isWeekend = isSaturday(day) || isSunday(day)

          // Filter events for this day
          const dayEvents = events.filter((event: EventType) => {
            const eventStart = new Date(event.start)
            return eventStart >= dayStart && eventStart <= dayEnd
          })

          return (
            <div key={day.toISOString()} className={`day-column ${isWeekend ? "weekend" : ""}`}>
              <div className={`day-header ${isWeekend ? "weekend" : ""}`}>
                <span className="day-name">{format(day, "EEEE")}</span>
                <span className="day-date">{format(day, "MMM d")}</span>
              </div>
              <div className="day-events">
                {dayEvents.length > 0 ? (
                  dayEvents.map((event: EventType) => (
                    <div
                      key={event.id}
                      className="day-event"
                      style={{ backgroundColor: event.color || EVENT_COLORS.other }}
                      onClick={() => onSelectEvent(event)}
                    >
                      <span className="event-time">{format(new Date(event.start), "h:mm a")}</span>
                      <span className="event-title">{event.title}</span>
                    </div>
                  ))
                ) : (
                  <div className="no-events">No events</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Custom AssignmentListItem component for flat, wide list view
const AssignmentListItem = ({
  assignment,
  progress,
  daysRemaining,
  isLate,
  onClick,
}: {
  assignment: Assignment
  progress: number
  daysRemaining: number
  isLate: boolean
  onClick: () => void
}) => {
  return (
    <div className="assignment-list-item" onClick={onClick}>
      <div className="assignment-list-color" style={{ backgroundColor: isLate ? "#E74C3C" : "#DD992B" }}></div>
      <div className="assignment-list-content">
        <div className="assignment-list-header">
          <div className="assignment-list-title">{assignment.title}</div>
          <div className="assignment-list-deadline">
            {isLate ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days remaining`}
          </div>
        </div>
        <div className="assignment-list-footer">
          <div className="assignment-list-progress">
            <div className="assignment-list-progress-bar">
              <div className="assignment-list-progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="assignment-list-progress-text">{progress}%</div>
          </div>
          <div className="assignment-list-weighting">{assignment.weighting}%</div>
        </div>
      </div>
    </div>
  )
}

// Update the Dashboard component to use AssignmentListItem
export default function Dashboard() {
  // State for data
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [events, setEvents] = useState<EventType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentWeekDate, setCurrentWeekDate] = useState(new Date())

  // State for event modal
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)

  // State for assignment overlay
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [isAssignmentOverlayOpen, setIsAssignmentOverlayOpen] = useState(false)

  // Add a useEffect to fetch the user session
  const [userId, setUserId] = useState<string | null>(null)

  // Add this useEffect at the beginning to get the user session
  useEffect(() => {
    const getSession = async () => {
      try {
        const res = await fetch("/api/auth/session")
        const session = await res.json()

        if (session?.user?.id) {
          setUserId(session.user.id)
        } else {
          console.warn("Session exists but user ID is missing")
        }
      } catch (error) {
        console.error("Error fetching session:", error)
      }
    }

    getSession()
  }, [])

  // Load data from backend APIs
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userId) return

      setIsLoading(true)
      try {
        // Fetch assignments - using the same endpoint as the assignments page
        const assignmentsRes = await fetch("/api/assignments")
        if (!assignmentsRes.ok) {
          throw new Error("Failed to fetch assignments")
        }
        const assignmentsData = await assignmentsRes.json()
        setAssignments(assignmentsData)

        // Fetch events - using the same endpoint as the calendar page with userId
        const eventsRes = await fetch(`/api/events?userId=${userId}`)
        if (!eventsRes.ok) {
          throw new Error("Failed to fetch events")
        }
        const eventsData = await eventsRes.json()

        // Format events for calendar - same as in schedule page
        const formattedEvents = eventsData.map((event: any) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
          color: event.color || EVENT_COLORS[event.eventType as keyof typeof EVENT_COLORS] || EVENT_COLORS.other,
        }))

        setEvents(formattedEvents)
        setError(null)
      } catch (err) {
        console.error("Error loading dashboard data:", err)
        setError("Failed to load dashboard data. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [userId])

  // Extract all tasks from assignments
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

  // Group tasks by status
  const groupedTasks = useMemo(() => {
    const groups: Record<string, (Task & { assignmentTitle: string; assignmentDeadline: string })[]> = {
      "To-Do": [],
      "In Progress": [],
      Completed: [],
    }

    allTasks.forEach((task) => {
      if (groups[task.status]) {
        groups[task.status].push(task)
      }
    })

    return groups
  }, [allTasks])

  // Check if there are any visible tasks
  const hasVisibleTasks = useMemo(() => {
    return Object.values(groupedTasks).some((tasks) => tasks.length > 0)
  }, [groupedTasks])

  // Handle task status change with backend integration - same as in task page
  const handleTaskStatusChange = useCallback(
    async (taskId: string, newStatus: TaskStatus) => {
      try {
        // Find the task and its assignment
        let foundAssignment: Assignment | undefined
        let foundTask: Task | undefined

        for (const assignment of assignments) {
          const task = assignment.tasks.find((t) => t.id === taskId)
          if (task) {
            foundAssignment = assignment
            foundTask = task
            break
          }
        }

        if (!foundAssignment || !foundTask) return

        // Optimistically update the UI
        setAssignments((prev) =>
          prev.map((assignment) => {
            if (assignment.id === foundAssignment?.id) {
              return {
                ...assignment,
                tasks: assignment.tasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task)),
              }
            }
            return assignment
          }),
        )

        // Make the API call to update the task - same as in task page
        const updateData = {
          status: newStatus,
        }

        const response = await fetch(`/api/tasks/${taskId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        })

        if (!response.ok) {
          throw new Error("Failed to update task status")
        }
      } catch (error) {
        console.error("Error updating task status:", error)
      }
    },
    [assignments],
  )

  // Handle event selection
  const handleSelectEvent = useCallback((event: EventType) => {
    setSelectedEvent(event)
    setIsEventModalOpen(true)
  }, [])

  // Handle updating event with backend integration - same as in calendar page
  const handleUpdateEvent = useCallback(async (updatedEvent: EventType) => {
    try {
      const response = await fetch("/api/events", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedEvent),
      })

      if (!response.ok) {
        throw new Error("Failed to update event")
      }

      const savedEvent = await response.json()

      setEvents((prev) =>
        prev.map((event) =>
          event.id === savedEvent.id
            ? { ...savedEvent, start: new Date(savedEvent.start), end: new Date(savedEvent.end) }
            : event,
        ),
      )

      setIsEventModalOpen(false)
      setSelectedEvent(null)
    } catch (error) {
      console.error("Error updating event:", error)
    }
  }, [])

  // Handle deleting event with backend integration - same as in calendar page
  const handleDeleteEvent = useCallback(async (eventId: string) => {
    try {
      const response = await fetch(`/api/events?id=${eventId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete event")
      }

      setEvents((prev) => prev.filter((event) => event.id !== eventId))
      setIsEventModalOpen(false)
      setSelectedEvent(null)
    } catch (error) {
      console.error("Error deleting event:", error)
    }
  }, [])

  // Handle assignment selection for overlay
  const handleSelectAssignment = useCallback((assignment: Assignment) => {
    setSelectedAssignment(assignment)
    setIsAssignmentOverlayOpen(true)
  }, [])

  // Handle assignment update with backend integration - same as in assignment page
  const handleAssignmentUpdate = useCallback(
    async (assignmentId: string, updates: Partial<Assignment>) => {
      try {
        // Find the base assignment using assignID - same as in assignment page
        const base = assignments.find((a) => a.id === assignmentId)
        if (!base) throw new Error("Assignment not found")

        const updatedAssignment = {
          ...base,
          ...updates,
          id: assignmentId, // ensure ID is preserved
        }

        const response = await fetch(`/api/assignments/${assignmentId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedAssignment),
        })

        if (!response.ok) {
          throw new Error("Failed to update assignment")
        }

        const updated = await response.json()

        setAssignments((prev) => prev.map((assignment) => (assignment.id === updated.id ? updated : assignment)))

        if (selectedAssignment?.id === updated.id) {
          setSelectedAssignment(updated)
        }
      } catch (error) {
        console.error("Error updating assignment:", error)
      }
    },
    [assignments, selectedAssignment],
  )

  // Handle task deletion - same as in assignment page
  const handleTaskDelete = useCallback(
    async (taskId: string) => {
      try {
        // Find the assignment containing this task
        let foundAssignment: Assignment | undefined

        for (const assignment of assignments) {
          const taskExists = assignment.tasks.some((t) => t.id === taskId)
          if (taskExists) {
            foundAssignment = assignment
            break
          }
        }

        if (!foundAssignment) return

        // Update the UI first (optimistic update)
        setAssignments((prev) =>
          prev.map((assignment) => {
            if (assignment.id === foundAssignment?.id) {
              return {
                ...assignment,
                tasks: assignment.tasks.filter((task) => task.id !== taskId),
              }
            }
            return assignment
          }),
        )

        // Then make the API call
        const response = await fetch(`/api/tasks/${taskId}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error("Failed to delete task")
        }
      } catch (error) {
        console.error("Error deleting task:", error)
      }
    },
    [assignments],
  )

  // Handle task update - same as in assignment page
  const handleTaskUpdate = useCallback(
    (taskId: string, updates: Partial<Task>) => {
      if (!selectedAssignment) {
        return
      }

      // Find the task in the assignments
      let foundAssignment: Assignment | undefined

      for (const assignment of assignments) {
        const taskExists = assignment.tasks.some((t) => t.id === taskId)
        if (taskExists) {
          foundAssignment = assignment
          break
        }
      }

      if (!foundAssignment) return

      // Update the task in the UI
      setAssignments((prev) =>
        prev.map((assignment) => {
          if (assignment.id === foundAssignment?.id) {
            return {
              ...assignment,
              tasks: assignment.tasks.map((task) => (task.id === taskId ? { ...task, ...updates } : task)),
            }
          }
          return assignment
        }),
      )

      // Update the selected assignment if needed
      if (selectedAssignment.id === foundAssignment.id) {
        setSelectedAssignment({
          ...selectedAssignment,
          tasks: selectedAssignment.tasks.map((task) => (task.id === taskId ? { ...task, ...updates } : task)),
        })
      }

      // Make the API call
      fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      }).catch((error) => {
        console.error("Error updating task:", error)
      })
    },
    [assignments, selectedAssignment],
  )

  // Handle task creation - same as in assignment page
  const handleTaskAdd = useCallback(
    async (text: string, dueDate?: string) => {
      if (!selectedAssignment) return

      try {
        // Build payload matching the POST handler
        const payload = {
          title: text,
          description: null,
          dueDate: dueDate,
        }

        // Send to the create-task endpoint
        const res = await fetch(`/api/assignments/${selectedAssignment.id}/tasks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })

        if (!res.ok) {
          let errorBody: any
          try {
            errorBody = await res.json()
          } catch {
            errorBody = await res.text()
          }
          console.error(`Create task failed (status ${res.status}):`, errorBody)
          throw new Error(
            typeof errorBody === "object" ? errorBody.error || JSON.stringify(errorBody) : errorBody || "Unknown error",
          )
        }

        // Parse the newly created Task
        const newTask = await res.json()

        // Merge into the assignments list
        setAssignments((prev) =>
          prev.map((a) => (a.id === selectedAssignment.id ? { ...a, tasks: [...a.tasks, newTask] } : a)),
        )

        // Update the selected assignment
        setSelectedAssignment({
          ...selectedAssignment,
          tasks: [...selectedAssignment.tasks, newTask],
        })
      } catch (error) {
        console.error("Error creating task:", error)
      }
    },
    [selectedAssignment],
  )

  // Handle assignment deletion - same as in assignment page
  const handleAssignmentDelete = useCallback(
    async (assignmentId: string) => {
      try {
        const response = await fetch(`/api/assignments/${assignmentId}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error("Failed to delete assignment")
        }

        // Remove assignment from state
        setAssignments((prev) => prev.filter((a) => a.id !== assignmentId))

        // Close overlay if open
        if (selectedAssignment?.id === assignmentId) {
          setIsAssignmentOverlayOpen(false)
          setSelectedAssignment(null)
        }
      } catch (error) {
        console.error("Error deleting assignment:", error)
      }
    },
    [selectedAssignment],
  )

  // Update the goToPreviousWeek and goToNextWeek functions to pass to CustomWeekView
  const goToPreviousWeek = useCallback(() => {
    setCurrentWeekDate((prev) => subWeeks(prev, 1))
  }, [])

  const goToNextWeek = useCallback(() => {
    setCurrentWeekDate((prev) => addWeeks(prev, 1))
  }, [])

  // Helper function to determine if an assignment is late
  const isAssignmentLate = useCallback((deadline: string) => {
    return new Date(deadline) < new Date()
  }, [])

  // Helper function to calculate days remaining
  const getDaysRemaining = useCallback((deadline: string) => {
    const today = new Date()
    const dueDate = new Date(deadline)
    const diffTime = dueDate.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }, [])

  // Helper function to calculate assignment progress
  const calculateProgress = useCallback((assignment: Assignment) => {
    if (!assignment.tasks || assignment.tasks.length === 0) return 0

    const completedTasks = assignment.tasks.filter((task) => task.status === "Completed").length
    return Math.round((completedTasks / assignment.tasks.length) * 100)
  }, [])

  // Loading state
  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loadingSpinner"></div>
        <p>Loading dashboard...</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="dashboard-error">
        <div className="errorIcon">!</div>
        <h2>Error Loading Dashboard</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard</h1>

      <div className="dashboard-grid">
        {/* Left Column */}
        <div className="dashboard-left">
          {/* Assignments Section */}
          <div className="dashboard-section assignments-section">
            <div className="section-header">
              <h2>Assignments</h2>
              <a href="/assignment" className="view-all-link">
                View All
              </a>
            </div>
            <div className="section-content">
              <div className="assignment-card-list">
                {
                  assignments ? (
                    assignments.map((assignment) => {
                      const late = isAssignmentLate(assignment.deadline);
                      const daysRemaining = getDaysRemaining(assignment.deadline);
                      const progress = calculateProgress(assignment);

                      return (
                        <AssignmentListItem
                          key={assignment.id}
                          assignment={assignment}
                          progress={progress}
                          daysRemaining={daysRemaining}
                          isLate={late}
                          onClick={() => handleSelectAssignment(assignment)}
                        />
                      );
                    })
                  ) : (
                    <div className="empty-tasks-message">
                      <div>
                        <ClipboardList size={48} strokeWidth={1} className="mb-4 mx-auto opacity-50" />
                        <p>No assignments available</p>
                      </div>
                    </div>
                  )
                }
              </div>
            </div>
          </div>

          {/* Tasks Section - No changes needed */}
          <div className="dashboard-section tasks-section">
            <div className="section-header">
              <h2>Tasks</h2>
              <a href="/task" className="view-all-link">
                View All
              </a>
            </div>
            <div className="section-content">
              {hasVisibleTasks ? (
                Object.entries(groupedTasks).map(
                  ([status, tasks]) =>
                    tasks.length > 0 && (
                      <TaskGroup
                        key={status}
                        title={status}
                        tasks={tasks}
                        viewMode="list"
                        onStatusChange={handleTaskStatusChange}
                        onTaskDelete={handleTaskDelete}
                      />
                    ),
                )
              ) : (
                <div className="empty-tasks-message">
                  <div>
                    <ClipboardList size={48} strokeWidth={1} className="mb-4 mx-auto opacity-50" />
                    <p>No tasks available</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Calendar */}
        <div className="dashboard-right">
          <div className="dashboard-section calendar-section">
            <div className="section-header">
              <h2>Schedule</h2>
              {/* Removed Previous Week and Next Week buttons */}
              <a href="/schedule" className="view-all-link">
                Full Calendar
              </a>
            </div>
            <div className="section-content">
              <CustomWeekView
                date={currentWeekDate}
                events={events}
                onSelectEvent={handleSelectEvent}
                onPrevWeek={goToPreviousWeek}
                onNextWeek={goToNextWeek}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {selectedEvent && (
        <EventModal
          isOpen={isEventModalOpen}
          event={selectedEvent}
          onClose={() => {
            setIsEventModalOpen(false)
            setSelectedEvent(null)
          }}
          onUpdate={handleUpdateEvent}
          onDelete={handleDeleteEvent}
          assignments={assignments}
        />
      )}

      {/* Assignment Overlay */}
      {selectedAssignment && (
        <AssignmentOverlay
          isOpen={isAssignmentOverlayOpen}
          assignment={selectedAssignment}
          onClose={() => {
            setIsAssignmentOverlayOpen(false)
            setSelectedAssignment(null)
          }}
          onTaskDelete={handleTaskDelete}
          onTaskUpdate={handleTaskUpdate}
          onAssignmentUpdate={handleAssignmentUpdate}
          onAssignmentDelete={handleAssignmentDelete}
          onTaskAdd={handleTaskAdd}
        />
      )}
    </div>
  )
}
