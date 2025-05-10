"use client"

import type React from "react"

import { useState } from "react"
import { Calendar, Clock, MapPin, FileText, Tag } from "lucide-react"
import { format } from "date-fns/format"
import Form from "../common/Form"
import FormItem from "../common/FormItem"
import FormRow from "../common/FormRow"
import type { Assignment } from "@/types/assignment"
import { CalendarEvent, EVENT_COLORS } from "@/types/event"

interface CreateAssignmentEventFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (event: CalendarEvent) => void
  assignment: Assignment
  initialEvent?: Partial<CalendarEvent>
}

export default function CreateAssignmentEventForm({
  isOpen,
  onClose,
  onSave,
  assignment,
  initialEvent,
}: CreateAssignmentEventFormProps) {
  const now = new Date()
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000)

  const [event, setEvent] = useState<CalendarEvent>({
    title: initialEvent?.title || "",
    start: initialEvent?.start || now,
    end: initialEvent?.end || oneHourLater,
    description: initialEvent?.description || "",
    location: initialEvent?.location || "",
    eventType: initialEvent?.eventType || "meeting",
    color: initialEvent?.color || EVENT_COLORS.meeting,
    assignmentId: assignment.id,
    assignmentTitle: assignment.title,
    allDay: initialEvent?.allDay || false,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setEvent((prev) => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const date = new Date(value)

    if (name === "startDate") {
      const newStart = new Date(event.start)
      newStart.setFullYear(date.getFullYear(), date.getMonth(), date.getDate())
      setEvent((prev) => ({ ...prev, start: newStart }))
    } else if (name === "endDate") {
      const newEnd = new Date(event.end)
      newEnd.setFullYear(date.getFullYear(), date.getMonth(), date.getDate())
      setEvent((prev) => ({ ...prev, end: newEnd }))
    }
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const [hours, minutes] = value.split(":").map(Number)

    if (name === "startTime") {
      const newStart = new Date(event.start)
      newStart.setHours(hours, minutes)
      setEvent((prev) => ({ ...prev, start: newStart }))
    } else if (name === "endTime") {
      const newEnd = new Date(event.end)
      newEnd.setHours(hours, minutes)
      setEvent((prev) => ({ ...prev, end: newEnd }))
    }
  }

  const handleEventTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const eventType = e.target.value as "assignment" | "meeting" | "task" | "presentation" | "other"
    setEvent((prev) => ({
      ...prev,
      eventType,
      color: EVENT_COLORS[eventType],
    }))
  }

  const handleAllDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isAllDay = e.target.checked
    setEvent((prev) => ({ ...prev, allDay: isAllDay }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate that end time is after start time
    if (event.end < event.start) {
      alert("End time must be after start time")
      return
    }

    onSave(event)
  }

  const isFormValid = event.title.trim() !== ""

  return (
    <Form
      isOpen={isOpen}
      onClose={onClose}
      onSave={handleSubmit}
      formTitle={initialEvent?.id ? "Edit Event" : "Add Event to Calendar"}
      formSubmitLabel={initialEvent?.id ? "Update Event" : "Add to Calendar"}
      disabledCondition={!isFormValid}
    >
      <FormItem label="Event Title" htmlFor="title">
        <input
          type="text"
          id="title"
          name="title"
          value={event.title}
          onChange={handleInputChange}
          placeholder="Enter event title"
          required
        />
      </FormItem>

      <FormItem icon={<Tag size={16} />} label="Event Type" htmlFor="eventType">
        <select id="eventType" name="eventType" value={event.eventType} onChange={handleEventTypeChange} required>
          <option value="meeting">Meeting</option>
          <option value="presentation">Presentation</option>
          <option value="other">Other</option>
        </select>
      </FormItem>

      <FormItem label="All Day Event" htmlFor="allDay">
        <div className="checkboxContainer">
          <input
            type="checkbox"
            id="allDay"
            name="allDay"
            checked={event.allDay}
            onChange={handleAllDayChange}
            className="checkbox"
          />
          <label htmlFor="allDay" className="checkboxLabel">
            This event lasts all day
          </label>
        </div>
      </FormItem>

      <FormRow>
        <FormItem icon={<Calendar size={16} />} label="Start Date" htmlFor="startDate">
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={format(event.start, "yyyy-MM-dd")}
            onChange={handleDateChange}
            required
          />
        </FormItem>

        {!event.allDay && (
          <FormItem icon={<Clock size={16} />} label="Start Time" htmlFor="startTime">
            <input
              type="time"
              id="startTime"
              name="startTime"
              value={format(event.start, "HH:mm")}
              onChange={handleTimeChange}
              required
            />
          </FormItem>
        )}
      </FormRow>

      <FormRow>
        <FormItem icon={<Calendar size={16} />} label="End Date" htmlFor="endDate">
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={format(event.end, "yyyy-MM-dd")}
            onChange={handleDateChange}
            required
          />
        </FormItem>

        {!event.allDay && (
          <FormItem icon={<Clock size={16} />} label="End Time" htmlFor="endTime">
            <input
              type="time"
              id="endTime"
              name="endTime"
              value={format(event.end, "HH:mm")}
              onChange={handleTimeChange}
              required
            />
          </FormItem>
        )}
      </FormRow>

      <FormItem icon={<MapPin size={16} />} label="Location" htmlFor="location">
        <input
          type="text"
          id="location"
          name="location"
          value={event.location || ""}
          onChange={handleInputChange}
          placeholder="e.g. Zoom, Room 302, etc."
        />
      </FormItem>

      <FormItem icon={<FileText size={16} />} label="Description" htmlFor="description">
        <textarea
          id="description"
          name="description"
          value={event.description || ""}
          onChange={handleInputChange}
          rows={3}
          placeholder="Add details about this event..."
        />
      </FormItem>

      <div className="eventPreview">
        <div className="eventPreviewLabel">Preview:</div>
        <div className="eventPreviewItem" style={{ backgroundColor: event.color }}>
          <div className="eventPreviewTitle">{event.title || "Event Title"}</div>
          <div className="eventPreviewDetails">
            <span>{format(event.start, "MMM d, yyyy")}</span>
            {!event.allDay && (
              <span>
                {format(event.start, "h:mm a")} - {format(event.end, "h:mm a")}
              </span>
            )}
            {event.location && <span>📍 {event.location}</span>}
          </div>
        </div>
      </div>
    </Form>
  )
}
