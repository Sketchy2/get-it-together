"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Calendar, Clock, List, Grid } from "lucide-react"
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar"
import {format} from "date-fns/format"
import {parse} from "date-fns/parse"
import {startOfWeek} from "date-fns/startOfWeek"
import {getDay} from "date-fns/getDay"
import {enUS} from "date-fns/locale/en-US"
import SortMenu from "@/components/common/SortMenu"
import type { SortOption, SortDirection } from "@/types/auxilary"
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
  const [filterAssignments, setFilterAssignments] = useState<string[]>([])
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [slotInfo, setSlotInfo] = useState<{ start: Date; end: Date } | null>(null)
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
        <div className="controlsContainer">
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
          </div>
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
        </div>
      </header>

      <div className="calendarContainer">
        <BigCalendar
          localizer={localizer}
          events={events}
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
