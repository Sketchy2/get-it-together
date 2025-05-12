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
  return (
    <div className="calendarEvent">
      <div className="eventTitle">{event.title}</div>
      {event.location && (
        <div className="eventLocation">
          <MapPin size={12} />
          <span>{event.location}</span>
        </div>
      )}
    </div>
  )
}
