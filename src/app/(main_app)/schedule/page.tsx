"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Calendar, Clock, List, Grid } from "lucide-react"
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar"
import {format} from "date-fns/format"
import {parse} from "date-fns/parse"
import {startOfWeek} from "date-fns/startOfWeek"
import {getDay} from "date-fns/getDay"
import {enUS} from "date-fns/locale/en-US"
import SortMenu from "@/components/SortMenu"
import type { SortOption, SortDirection } from "@/types/sort"
import type { Assignment } from "@/types/assignment"
import EventModal from "@/components/calendar/EventModal"
import CreateEventModal from "@/components/calendar/CreateEventModal"
import CalendarToolbar from "@/components/calendar/CalendarToolBar"
import CalendarEvent from "@/components/calendar/CalendarEvent"
import "./calendar.css"
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

// Define view types
type CalendarViewType = "month" | "week" | "day" | "agenda"

// Define event colors by type
const EVENT_COLORS = {
  assignment: "#E74C3C", // Red for assignment due
  meeting: "#3498DB", // Blue for meetings
  task: "#2ECC71", // Green for task due
  presentation: "#F39C12", // Orange for presentations
  other: "#9B59B6", // Purple for others
}

export default function SchedulePage() {
  // State for calendar data
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [events, setEvents] = useState<EventType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State for view options
  const [view, setView] = useState<CalendarViewType>("month")
  const [date, setDate] = useState(new Date())
  const [sortMenuOpen, setSortMenuOpen] = useState(false)
  const [filterAssignments, setFilterAssignments] = useState<string[]>([])

  // State for modals
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [slotInfo, setSlotInfo] = useState<{ start: Date; end: Date } | null>(null)

  // Sort options
  const sortOptions: SortOption[] = [
    { key: "date", label: "Date", icon: <Calendar size={16} /> },
    { key: "assignment", label: "Assignment", icon: <List size={16} /> },
  ]
  const [sortBy, setSortBy] = useState<SortOption>(sortOptions[0])
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

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
        tasks: [],
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
        tasks: [],
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
        tasks: [],
        files: [],
        links: [],
      },
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
        console.error("Error loading calendar data:", err)
        setError("Failed to load calendar data. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [getSampleData])

  // Filter events based on selected assignments
  const filteredEvents = useMemo(() => {
    if (filterAssignments.length === 0) {
      return events
    }
    return events.filter((event) => event.assignmentId && filterAssignments.includes(event.assignmentId))
  }, [events, filterAssignments])

  // Sort events based on current sort option
  const sortedEvents = useMemo(() => {
    return [...filteredEvents].sort((a, b) => {
      if (sortBy.key === "date") {
        return sortDirection === "asc" ? a.start.getTime() - b.start.getTime() : b.start.getTime() - a.start.getTime()
      } else if (sortBy.key === "assignment") {
        const titleA = a.assignmentTitle || ""
        const titleB = b.assignmentTitle || ""
        return sortDirection === "asc" ? titleA.localeCompare(titleB) : titleB.localeCompare(titleA)
      }
      return 0
    })
  }, [filteredEvents, sortBy, sortDirection])

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

  // Handle event selection
  const handleSelectEvent = useCallback((event: EventType) => {
    setSelectedEvent(event)
    setIsEventModalOpen(true)
  }, [])

  // Handle slot selection (for creating new events)
  const handleSelectSlot = useCallback(({ start, end }: { start: Date; end: Date }) => {
    setSlotInfo({ start, end })
    setIsCreateModalOpen(true)
  }, [])

  // Handle creating new event
  const handleCreateEvent = useCallback((newEvent: EventType) => {
    setEvents((prev) => [...prev, { ...newEvent, id: `e${prev.length + 1}` }])
    setIsCreateModalOpen(false)
    setSlotInfo(null)
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

  // Handle filter change
  const handleFilterChange = useCallback((assignmentId: string) => {
    setFilterAssignments((prev) => {
      if (prev.includes(assignmentId)) {
        return prev.filter((id) => id !== assignmentId)
      } else {
        return [...prev, assignmentId]
      }
    })
  }, [])

  // Custom components for the calendar
  const components = {
    toolbar: (props: any) => (
      <CalendarToolbar
        {...props}
        assignments={assignments}
        filterAssignments={filterAssignments}
        onFilterChange={handleFilterChange}
      />
    ),
    event: (props: any) => <CalendarEvent {...props} />,
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="loadingContainer">
        <div className="loadingSpinner"></div>
        <p>Loading calendar...</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="errorContainer">
        <div className="errorIcon">!</div>
        <h2>Error Loading Calendar</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    )
  }

  return (
    <div className="calendarPageContainer">
      <header className="calendarHeader">
        <h1 className="calendarTitle">Schedule</h1>
        <div className="calendarActions">
          <div className="viewControls">
            <button className={`viewButton ${view === "month" ? "active" : ""}`} onClick={() => setView("month")}>
              <Grid size={16} />
              <span>Month</span>
            </button>
            <button className={`viewButton ${view === "week" ? "active" : ""}`} onClick={() => setView("week")}>
              <Calendar size={16} />
              <span>Week</span>
            </button>
            <button className={`viewButton ${view === "day" ? "active" : ""}`} onClick={() => setView("day")}>
              <Clock size={16} />
              <span>Day</span>
            </button>
            <button className={`viewButton ${view === "agenda" ? "active" : ""}`} onClick={() => setView("agenda")}>
              <List size={16} />
              <span>Agenda</span>
            </button>
          </div>
          <SortMenu
            sortMenuOpen={sortMenuOpen}
            setSortMenuOpen={() => setSortMenuOpen(!sortMenuOpen)}
            sortBy={sortBy}
            sortDirection={sortDirection}
            handleSortChange={handleSortChange}
            options={sortOptions}
          />
        </div>
      </header>

      {/* Updated color legend */}
      <div className="colorLegend">
        <div className="legendItem">
          <div className="colorSwatch" style={{ backgroundColor: EVENT_COLORS.assignment }}></div>
          <span>Assignment Due</span>
        </div>
        <div className="legendItem">
          <div className="colorSwatch" style={{ backgroundColor: EVENT_COLORS.meeting }}></div>
          <span>Meeting</span>
        </div>
        <div className="legendItem">
          <div className="colorSwatch" style={{ backgroundColor: EVENT_COLORS.task }}></div>
          <span>Task Due</span>
        </div>
        <div className="legendItem">
          <div className="colorSwatch" style={{ backgroundColor: EVENT_COLORS.presentation }}></div>
          <span>Presentation</span>
        </div>
        <div className="legendItem">
          <div className="colorSwatch" style={{ backgroundColor: EVENT_COLORS.other }}></div>
          <span>Others</span>
        </div>
        {view === "agenda" && (
          <div style={{ marginLeft: "auto", fontSize: "0.9rem", color: "rgba(255, 255, 255, 0.7)" }}>
            Agenda View: A list of all upcoming events organized by date
          </div>
        )}
      </div>

      <div className="calendarContainer">
        <BigCalendar
          localizer={localizer}
          events={sortedEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 700 }}
          view={view}
          onView={(newView: any) => setView(newView as CalendarViewType)}
          date={date}
          onNavigate={setDate}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          components={components}
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: event.color || EVENT_COLORS.other,
            },
          })}
        />
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

      {/* Create Event Modal */}
      {slotInfo && (
        <CreateEventModal
          isOpen={isCreateModalOpen}
          slotInfo={slotInfo}
          onClose={() => {
            setIsCreateModalOpen(false)
            setSlotInfo(null)
          }}
          onSave={handleCreateEvent}
          assignments={assignments}
        />
      )}
    </div>
  )
}
