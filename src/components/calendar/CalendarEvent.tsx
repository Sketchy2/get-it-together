import { MapPin, Clock } from "lucide-react"
import "./CalendarEvent.css"

interface CalendarEventProps {
  event: {
    title: string
    location?: string
    start: Date
    end: Date
  }
}

export default function CalendarEvent({ event }: CalendarEventProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getTimeRange = () => {
    return `${formatTime(event.start)} - ${formatTime(event.end)}`
  }

  return (
    <div className="calendarEvent">
      <div className="eventTitle">{event.title}</div>
      {event.location && (
        <div className="eventLocation">
          <MapPin size={12} />
          <span>{event.location}</span>
        </div>
      )}
      <div className="eventTime">
        <Clock size={12} />
        <span>{getTimeRange()}</span>
      </div>
    </div>
  )
}
