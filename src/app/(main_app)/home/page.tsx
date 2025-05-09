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

// Setup localizer for react-big-calendar
const locales = {
  "en-US": enUS,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

// Define event type
interface EventType {
  id: string
  title: string
  start: Date
  end: Date
  allDay?: boolean
  assignmentId?: string
  assignmentTitle?: string
  description?: string
  location?: string
  color?: string
  eventType?: "assignment" | "meeting" | "task" | "presentation" | "other"
}

// Define event colors by type
const EVENT_COLORS = {
  assignment: "#E74C3C", // Red for assignment due
  meeting: "#3498DB", // Blue for meetings
  task: "#2ECC71", // Green for task due
  presentation: "#F39C12", // Orange for presentations
  other: "#9B59B6", // Purple for others
}

// Define task status colors
const TASK_STATUS_COLORS = {
  "To-Do": "#DD992B", // Yellow for To-Do
  "In Progress": "#3498DB", // Blue for In Progress
  Completed: "#2ECC71", // Green for Completed
}

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

// Custom TaskItem component to override the default styling
const CustomTaskItem = ({
  task,
  onStatusChange,
}: {
  task: Task & { assignmentTitle: string; assignmentDeadline: string }
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void
}) => {
  // Get the appropriate color for the task status
  const statusColor = TASK_STATUS_COLORS[task.status as keyof typeof TASK_STATUS_COLORS] || "#ffffff"

  return (
    <div className="custom-task-item">
      <div className="task-header">
        <span className="task-title">{task.title}</span>
        <span
          className={`task-status task-status-${task.status.toLowerCase().replace(/\s+/g, "")}`}
          style={{ color: statusColor }}
        >
          {task.status}
        </span>
      </div>
      <div className="task-assignment">From: {task.assignmentTitle}</div>
      <div className="task-actions">
        {task.status !== "Completed" && (
          <button onClick={() => onStatusChange(task.id, "Completed")} className="task-complete-btn">
            Mark Complete
          </button>
        )}
        {task.status === "To-Do" && (
          <button onClick={() => onStatusChange(task.id, "In Progress")} className="task-progress-btn">
            Start
          </button>
        )}
        {task.status === "In Progress" && (
          <button onClick={() => onStatusChange(task.id, "To-Do")} className="task-todo-btn">
            Back to To-Do
          </button>
        )}
      </div>
    </div>
  )
}

// Custom TaskGroup component to apply status colors
const CustomTaskGroup = ({
  title,
  tasks,
  onStatusChange,
}: {
  title: string
  tasks: (Task & { assignmentTitle: string; assignmentDeadline: string })[]
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void
}) => {
  // Get the appropriate color for the task status
  const statusColor = TASK_STATUS_COLORS[title as keyof typeof TASK_STATUS_COLORS] || "#ffffff"

  return (
    <div className="custom-task-group">
      <div className="task-group-header" style={{ borderBottomColor: statusColor }}>
        <h3 style={{ color: statusColor }}>
          {title} ({tasks.length})
        </h3>
      </div>
      <div className="task-group-content">
        {tasks.map((task) => (
          <div key={task.id} className="task-item">
            <div className="task-title">{task.title}</div>
            <div className="task-assignment">From: {task.assignmentTitle}</div>
          </div>
        ))}
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

  // Sample data generator function (would be replaced with API calls in production)
  const getSampleData = useCallback((): { assignments: Assignment[]; events: EventType[] } => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)

    const lastWeek = new Date(today)
    lastWeek.setDate(lastWeek.getDate() - 7)

    // Get Saturday and Sunday for this week
    const saturday = new Date(today)
    while (!isSaturday(saturday)) {
      saturday.setDate(saturday.getDate() + 1)
    }

    const sunday = new Date(today)
    while (!isSunday(sunday)) {
      sunday.setDate(sunday.getDate() + 1)
    }

    // Sample assignments
    const assignments: Assignment[] = [
      {
        id: "a1",
        title: "Research Paper on Climate Change",
        description: "A comprehensive analysis of climate change factors and their global impact.",
        createdAt: lastWeek.toISOString(),
        deadline: nextWeek.toISOString(),
        weighting: 40,
        members: [{ id: "m1", name: "John Doe" }],
        tasks: [
          {
            id: "t1",
            title: "Literature Review",
            description: "Review existing research papers",
            status: "In Progress",
            priority: "high",
            deadline: tomorrow.toISOString(),
          },
          {
            id: "t2",
            title: "Data Collection",
            description: "Gather climate data from reliable sources",
            status: "To-Do",
            priority: "medium",
            deadline: nextWeek.toISOString(),
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
        deadline: tomorrow.toISOString(),
        weighting: 30,
        members: [{ id: "m1", name: "John Doe" }],
        tasks: [
          {
            id: "t3",
            title: "Outline Structure",
            description: "Create outline for the review",
            status: "Completed",
            priority: "high",
            deadline: yesterday.toISOString(),
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
        deadline: yesterday.toISOString(),
        weighting: 25,
        members: [{ id: "m1", name: "John Doe" }],
        tasks: [
          {
            id: "t4",
            title: "Create Slides",
            description: "Design presentation slides",
            status: "In Progress",
            priority: "medium",
            deadline: yesterday.toISOString(),
          },
          {
            id: "t5",
            title: "Practice Presentation",
            description: "Rehearse the presentation",
            status: "To-Do",
            priority: "high",
            deadline: today.toISOString(),
          },
        ],
        files: [],
        links: [],
      },
      {
        id: "a4",
        title: "Group Presentation",
        description: "Prepare slides and talking points for the final presentation.",
        createdAt: lastWeek.toISOString(),
        deadline: yesterday.toISOString(),
        weighting: 25,
        members: [{ id: "m1", name: "John Doe" }],
        tasks: [
          {
            id: "t4",
            title: "Create Slides",
            description: "Design presentation slides",
            status: "In Progress",
            priority: "medium",
            deadline: yesterday.toISOString(),
          },
          {
            id: "t5",
            title: "Practice Presentation",
            description: "Rehearse the presentation",
            status: "To-Do",
            priority: "high",
            deadline: today.toISOString(),
          },
        ],
        files: [],
        links: [],
      }
    ]

    // Sample events
    const events: EventType[] = [
      {
        id: "e1",
        title: "Team Meeting",
        start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0),
        end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 30),
        assignmentId: "a1",
        assignmentTitle: "Research Paper on Climate Change",
        description: "Discuss research methodology and divide tasks",
        location: "Zoom",
        eventType: "meeting",
        color: EVENT_COLORS.meeting,
      },
      {
        id: "e2",
        title: "Literature Review Due",
        start: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 14, 0),
        end: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 16, 0),
        assignmentId: "a2",
        assignmentTitle: "Literature Review",
        description: "Final submission deadline",
        location: "Online Portal",
        eventType: "assignment",
        color: EVENT_COLORS.assignment,
      },
      {
        id: "e3",
        title: "Group Presentation",
        start: new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate(), 13, 0),
        end: new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate(), 15, 0),
        assignmentId: "a3",
        assignmentTitle: "Group Presentation",
        description: "Final presentation to the class",
        location: "Room 302",
        eventType: "presentation",
        color: EVENT_COLORS.presentation,
      },
      {
        id: "e4",
        title: "Data Collection Task Due",
        start: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 9, 0),
        end: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 12, 0),
        assignmentId: "a1",
        assignmentTitle: "Research Paper on Climate Change",
        description: "Complete data collection phase",
        location: "Lab",
        eventType: "task",
        color: EVENT_COLORS.task,
      },
      {
        id: "e5",
        title: "Study Session",
        start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 0),
        end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 17, 0),
        description: "Group study session for upcoming exam",
        location: "Library",
        eventType: "other",
        color: EVENT_COLORS.other,
      },
      // Add weekend events
      {
        id: "e6",
        title: "Weekend Study Group",
        start: new Date(saturday.getFullYear(), saturday.getMonth(), saturday.getDate(), 11, 0),
        end: new Date(saturday.getFullYear(), saturday.getMonth(), saturday.getDate(), 14, 0),
        description: "Group study session for upcoming exam",
        location: "Coffee Shop",
        eventType: "other",
        color: EVENT_COLORS.other,
      },
      {
        id: "e7",
        title: "Research Planning",
        start: new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate(), 13, 0),
        end: new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate(), 15, 0),
        assignmentId: "a1",
        assignmentTitle: "Research Paper on Climate Change",
        description: "Plan research approach and methodology",
        location: "Home",
        eventType: "meeting",
        color: EVENT_COLORS.meeting,
      },
    ]

    return { assignments, events }
  }, [])

  // Load data on component mount
  useEffect(() => {
    setIsLoading(true)

    // Simulate API call with timeout
    const timer = setTimeout(() => {
      try {
        const { assignments, events } = getSampleData()
        setAssignments(assignments)
        setEvents(events)
        setError(null)
      } catch (err) {
        console.error("Error loading dashboard data:", err)
        setError("Failed to load dashboard data. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [getSampleData])

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

  // Handle task status change
  const handleTaskStatusChange = useCallback(
    async (taskId: string, newStatus: TaskStatus) => {
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

      // Update the task status in state
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

      // In a real app, you would make an API call here
      // await fetch(`/api/tasks/${taskId}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ status: newStatus })
      // });
    },
    [assignments],
  )

  // Handle event selection
  const handleSelectEvent = useCallback((event: EventType) => {
    setSelectedEvent(event)
    setIsEventModalOpen(true)
  }, [])

  // Handle updating event
  const handleUpdateEvent = useCallback((updatedEvent: EventType) => {
    setEvents((prev) => prev.map((event) => (event.id === updatedEvent.id ? updatedEvent : event)))
    setIsEventModalOpen(false)
    setSelectedEvent(null)
  }, [])

  // Handle deleting event
  const handleDeleteEvent = useCallback((eventId: string) => {
    setEvents((prev) => prev.filter((event) => event.id !== eventId))
    setIsEventModalOpen(false)
    setSelectedEvent(null)
  }, [])

  // Handle assignment selection for overlay
  const handleSelectAssignment = useCallback((assignment: Assignment) => {
    setSelectedAssignment(assignment)
    setIsAssignmentOverlayOpen(true)
  }, [])

  // Handle assignment update
  const handleAssignmentUpdate = useCallback((assignmentId: string, updates: Partial<Assignment>) => {
    setAssignments((prev) =>
      prev.map((assignment) => (assignment.id === assignmentId ? { ...assignment, ...updates } : assignment)),
    )
  }, [])

  // Handle task deletion
  const handleTaskDelete = useCallback((taskId: string) => {
    setAssignments((prev) =>
      prev.map((assignment) => ({
        ...assignment,
        tasks: assignment.tasks.filter((task) => task.id !== taskId),
      })),
    )
  }, [])

  // Handle task update
  const handleTaskUpdate = useCallback((taskId: string, updates: Partial<Task>) => {
    setAssignments((prev) =>
      prev.map((assignment) => ({
        ...assignment,
        tasks: assignment.tasks.map((task) => (task.id === taskId ? { ...task, ...updates } : task)),
      })),
    )
  }, [])

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
                {assignments.map((assignment) => {
                  const late = isAssignmentLate(assignment.deadline)
                  const daysRemaining = getDaysRemaining(assignment.deadline)
                  const progress = calculateProgress(assignment)

                  return (
                    <AssignmentListItem
                      key={assignment.id}
                      assignment={assignment}
                      progress={progress}
                      daysRemaining={daysRemaining}
                      isLate={late}
                      onClick={() => handleSelectAssignment(assignment)}
                    />
                  )
                })}
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
        />
      )}
    </div>
  )
}
