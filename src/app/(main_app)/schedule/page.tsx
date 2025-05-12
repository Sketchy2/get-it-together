"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Calendar, Clock, List, Grid } from "lucide-react"
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar"
import { format, parse, startOfWeek, getDay } from "date-fns"
import { enUS } from "date-fns/locale"
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
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const getSession = async () => {
      const res = await fetch("/api/auth/session")
      const session = await res.json()
      console.log("Session data from /api/auth/session:", session)
  
      if (session?.user?.id) {
        setUserId(session.user.id)
      } else {
        console.warn("Session exists but user ID is missing")
      }
    }
    getSession()
  }, [])
  

  useEffect(() => {
    const loadEvents = async () => {
      if (!userId) return
      setIsLoading(true)
      try {
        const res = await fetch(`/api/events?userId=${userId}`)
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
        console.error("Error loading calendar data:", err)
        setError("Failed to load calendar data. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
    loadEvents()
  }, [userId])

  useEffect(() => {
    const loadUserAssignments = async () => {
      if (!userId) return
      try {
        const res = await fetch(`/api/user/assignment?userId=${userId}`)
        if (!res.ok) throw new Error("Failed to fetch assignments")
        const data = await res.json()
        setAssignments(data)
      } catch (err) {
        console.error("Failed to load user assignments", err)
      }
    }
    loadUserAssignments()
  }, [userId])
  
  

  const filteredEvents = useMemo(() => {
    if (filterAssignments.length === 0) return events
    return events.filter((event) => event.assignmentId && filterAssignments.includes(event.assignmentId))
  }, [events, filterAssignments])

  const sortedEvents = useMemo(() => filteredEvents, [filteredEvents])

  const handleSelectEvent = useCallback((event: EventType) => {
    setSelectedEvent(event)
    setIsEventModalOpen(true)
  }, [])

  const handleSelectSlot = useCallback(({ start, end }: { start: Date; end: Date }) => {
    setSlotInfo({ start, end })
    setIsCreateModalOpen(true)
  }, [])

  const handleCreateEvent = useCallback(async (newEvent: EventType) => {
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newEvent, userId }), // ✅ Include userId
      })
      const saved = await res.json()
      setEvents((prev) => [...prev, { ...saved, start: new Date(saved.start), end: new Date(saved.end) }])
    } catch (err) {
      console.error("Failed to create event", err)
    } finally {
      setIsCreateModalOpen(false)
      setSlotInfo(null)
    }
  }, [userId])
  

  const handleUpdateEvent = useCallback(async (updatedEvent: EventType) => {
    try {
      const res = await fetch("/api/events", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedEvent),
      })
      const saved = await res.json()
      setEvents((prev) => prev.map((event) => event.id === saved.id ? { ...saved, start: new Date(saved.start), end: new Date(saved.end) } : event))
    } catch (err) {
      console.error("Failed to update event", err)
    } finally {
      setIsEventModalOpen(false)
      setSelectedEvent(null)
    }
  }, [])

  const handleDeleteEvent = useCallback(async (eventId: string) => {
    try {
      await fetch(`/api/events?id=${eventId}`, { method: "DELETE" })
      setEvents((prev) => prev.filter((event) => event.id !== eventId))
    } catch (err) {
      console.error("Failed to delete event", err)
    } finally {
      setIsEventModalOpen(false)
      setSelectedEvent(null)
    }
  }, [])

  const handleFilterChange = useCallback((assignmentId: string) => {
    setFilterAssignments((prev) => prev.includes(assignmentId) ? prev.filter((id) => id !== assignmentId) : [...prev, assignmentId])
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
            {Object.entries(EVENT_COLORS).map(([type, color]) => (
              <div key={type} className="legendItem">
                <div className="colorSwatch" style={{ backgroundColor: color }}></div>
                <span>{type.charAt(0).toUpperCase() + type.slice(1)}{type === "other" ? "s" : " Due"}</span>
              </div>
            ))}
            {view === "agenda" && <div className="agendaNote">Agenda View: A list of all upcoming events organized by date</div>}
          </div>
          <div className="viewControls">
            <button className={`viewButton ${view === "month" ? "active" : ""}`} onClick={() => setView("month")}><Grid size={16} /><span>Month</span></button>
            <button className={`viewButton ${view === "week" ? "active" : ""}`} onClick={() => setView("week")}><Calendar size={16} /><span>Week</span></button>
            <button className={`viewButton ${view === "day" ? "active" : ""}`} onClick={() => setView("day")}><Clock size={16} /><span>Day</span></button>
            <button className={`viewButton ${view === "agenda" ? "active" : ""}`} onClick={() => setView("agenda")}><List size={16} /><span>Agenda</span></button>
          </div>
        </div>
      </header>

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
          userId={userId}
        />
      )}

    </div>
  )
}