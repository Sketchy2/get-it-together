"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Calendar, Clock, List, Grid } from "lucide-react"
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar"
import { format, parse, startOfWeek, getDay } from "date-fns"
import { enUS } from "date-fns/locale"
import SortMenu from "@/components/SortMenu"
import type { SortOption, SortDirection } from "@/types/sort"
import type { Assignment } from "@/types/assignment"
import { EventType } from "@/types/event"
import EventModal from "@/components/calendar/EventModal"
import CreateEventModal from "@/components/calendar/CreateEventModal"
import CalendarToolbar from "@/components/calendar/CalendarToolBar"
import CalendarEvent from "@/components/calendar/CalendarEvent"
import "./calendar.css"
import "react-big-calendar/lib/css/react-big-calendar.css"

const locales = { "en-US": enUS }

const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales })

type CalendarViewType = "month" | "week" | "day" | "agenda"

const EVENT_COLORS = {
  assignment: "#E74C3C",
  meeting: "#3498DB",
  task: "#2ECC71",
  presentation: "#F39C12",
  other: "#9B59B6",
}

export default function SchedulePage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [events, setEvents] = useState<EventType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<CalendarViewType>("month")
  const [date, setDate] = useState(new Date())
  const [sortMenuOpen, setSortMenuOpen] = useState(false)
  const [filterAssignments, setFilterAssignments] = useState<string[]>([])
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [slotInfo, setSlotInfo] = useState<{ start: Date; end: Date } | null>(null)

  const sortOptions: SortOption[] = [
    { key: "date", label: "Date", icon: <Calendar size={16} /> },
    { key: "assignment", label: "Assignment", icon: <List size={16} /> },
  ]
  const [sortBy, setSortBy] = useState<SortOption>(sortOptions[0])
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const res = await fetch("/api/events")
        if (!res.ok) throw new Error("Failed to fetch events")
        const data = await res.json()
        const formatted = data.map((event: EventType) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
        }))
        setEvents(formatted)
        setError(null)
      } catch (err) {
        console.error("Failed to load calendar events:", err)
        setError("Failed to load calendar data. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const filteredEvents = useMemo(() => {
    if (filterAssignments.length === 0) return events
    return events.filter((e) => e.assignmentId && filterAssignments.includes(e.assignmentId))
  }, [events, filterAssignments])

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

  const handleSortChange = useCallback((sortOption: SortOption) => {
    if (sortBy.key === sortOption.key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortBy(sortOption)
      setSortDirection("asc")
    }
  }, [sortBy])

  const handleSelectEvent = useCallback((event: EventType) => {
    setSelectedEvent(event)
    setIsEventModalOpen(true)
  }, [])

  const handleSelectSlot = useCallback(({ start, end }: { start: Date; end: Date }) => {
    setSlotInfo({ start, end })
    setIsCreateModalOpen(true)
  }, [])

  const handleCreateEvent = useCallback(async (newEvent: EventType) => {
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEvent),
    })
    const saved = await res.json()
    setEvents((prev) => [...prev, { ...saved, start: new Date(saved.start), end: new Date(saved.end) }])
    setIsCreateModalOpen(false)
    setSlotInfo(null)
  }, [])

  const handleUpdateEvent = useCallback(async (updatedEvent: EventType) => {
    const res = await fetch("/api/events", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedEvent),
    })
    const data = await res.json()
    setEvents((prev) => prev.map((e) => (e.id === data.id ? { ...data, start: new Date(data.start), end: new Date(data.end) } : e)))
    setIsEventModalOpen(false)
    setSelectedEvent(null)
  }, [])

  const handleDeleteEvent = useCallback(async (eventId: string) => {
    await fetch(`/api/events?id=${eventId}`, { method: "DELETE" })
    setEvents((prev) => prev.filter((e) => e.id !== eventId))
    setIsEventModalOpen(false)
    setSelectedEvent(null)
  }, [])

  const handleFilterChange = useCallback((assignmentId: string) => {
    setFilterAssignments((prev) => (prev.includes(assignmentId) ? prev.filter((id) => id !== assignmentId) : [...prev, assignmentId]))
  }, [])

  const components = {
    toolbar: (props: any) => <CalendarToolbar {...props} assignments={assignments} filterAssignments={filterAssignments} onFilterChange={handleFilterChange} />,
    event: (props: any) => <CalendarEvent {...props} />,
  }

  if (isLoading) {
    return <div className="loadingContainer"><div className="loadingSpinner"></div><p>Loading calendar...</p></div>
  }

  if (error) {
    return <div className="errorContainer"><div className="errorIcon">!</div><h2>Error Loading Calendar</h2><p>{error}</p><button onClick={() => window.location.reload()}>Try Again</button></div>
  }

  return (
    <div className="calendarPageContainer">
      <header className="calendarHeader">
        <h1 className="calendarTitle">Schedule</h1>
        <div className="calendarActions">
          <div className="viewControls">
            <button className={`viewButton ${view === "month" ? "active" : ""}`} onClick={() => setView("month")}><Grid size={16} /><span>Month</span></button>
            <button className={`viewButton ${view === "week" ? "active" : ""}`} onClick={() => setView("week")}><Calendar size={16} /><span>Week</span></button>
            <button className={`viewButton ${view === "day" ? "active" : ""}`} onClick={() => setView("day")}><Clock size={16} /><span>Day</span></button>
            <button className={`viewButton ${view === "agenda" ? "active" : ""}`} onClick={() => setView("agenda")}><List size={16} /><span>Agenda</span></button>
          </div>
          <SortMenu sortMenuOpen={sortMenuOpen} setSortMenuOpen={() => setSortMenuOpen(!sortMenuOpen)} sortBy={sortBy} sortDirection={sortDirection} handleSortChange={handleSortChange} options={sortOptions} />
        </div>
      </header>

      <div className="colorLegend">
        {Object.entries(EVENT_COLORS).map(([type, color]) => (
          <div key={type} className="legendItem">
            <div className="colorSwatch" style={{ backgroundColor: color }}></div>
            <span>{type.charAt(0).toUpperCase() + type.slice(1)}{type === "other" ? "s" : " Due"}</span>
          </div>
        ))}
        {view === "agenda" && <div style={{ marginLeft: "auto", fontSize: "0.9rem", color: "rgba(255, 255, 255, 0.7)" }}>Agenda View: A list of all upcoming events organized by date</div>}
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
          eventPropGetter={(event) => ({ style: { backgroundColor: event.color || EVENT_COLORS.other } })}
        />
      </div>

      {selectedEvent && <EventModal isOpen={isEventModalOpen} event={selectedEvent} onClose={() => { setIsEventModalOpen(false); setSelectedEvent(null) }} onUpdate={handleUpdateEvent} onDelete={handleDeleteEvent} assignments={assignments} />}

      {slotInfo && <CreateEventModal isOpen={isCreateModalOpen} slotInfo={slotInfo} onClose={() => { setIsCreateModalOpen(false); setSlotInfo(null) }} onSave={handleCreateEvent} assignments={assignments} />}
    </div>
  )
}
