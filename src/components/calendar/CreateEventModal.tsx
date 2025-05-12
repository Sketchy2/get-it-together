"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { format } from "date-fns/format"
import type { Assignment } from "@/types/assignment"
import "./CreateEventModal.css"

interface CalendarEvent {
  id?: string
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
  userId?: string
}



// Define event colors by type
const EVENT_COLORS = {
  assignment: "#E74C3C", // Red for assignment due
  meeting: "#3498DB", // Blue for meetings
  task: "#2ECC71", // Green for task due
  presentation: "#F39C12", // Orange for presentations
  other: "#9B59B6", // Purple for others
}

interface CreateEventModalProps {
  isOpen: boolean
  slotInfo: { start: Date; end: Date }
  onClose: () => void
  onSave: (newEvent: CalendarEvent) => void
  assignments: Assignment[]
  userId: string | null
}

export default function CreateEventModal({ isOpen, slotInfo, onClose, onSave, assignments, userId }: CreateEventModalProps) {
  console.log(assignments)
  const [newEvent, setNewEvent] = useState<Omit<CalendarEvent, "id">>({
    title: "",
    start: slotInfo.start,
    end: slotInfo.end,
    description: "",
    location: "",
    assignmentId: undefined,
    assignmentTitle: undefined,
    eventType: "other",
    color: EVENT_COLORS.other,
  })
  
  
  useEffect(() => {
    if (slotInfo) {
      setNewEvent({
        title: "",
        start: new Date(slotInfo.start),
        end: new Date(slotInfo.end),
        description: "",
        location: "",
        eventType: "other",
        color: EVENT_COLORS.other,
      })
    }
  }, [slotInfo])

  if (!isOpen) return null

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewEvent((prev) => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const date = new Date(value)

    if (name === "startDate") {
      const newStart = new Date(newEvent.start)
      newStart.setFullYear(date.getFullYear(), date.getMonth(), date.getDate())
      setNewEvent((prev) => ({ ...prev, start: newStart }))
    } else if (name === "endDate") {
      const newEnd = new Date(newEvent.end)
      newEnd.setFullYear(date.getFullYear(), date.getMonth(), date.getDate())
      setNewEvent((prev) => ({ ...prev, end: newEnd }))
    }
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const [hours, minutes] = value.split(":").map(Number)
  
    if (isNaN(hours) || isNaN(minutes)) return
  
    if (name === "startTime") {
      const newStart = new Date(newEvent.start)
      newStart.setHours(hours)
      newStart.setMinutes(minutes)
      newStart.setSeconds(0)
      setNewEvent((prev) => ({ ...prev, start: newStart }))
    } else if (name === "endTime") {
      const newEnd = new Date(newEvent.end)
      newEnd.setHours(hours)
      newEnd.setMinutes(minutes)
      newEnd.setSeconds(0)
      setNewEvent((prev) => ({ ...prev, end: newEnd }))
    }
  }
  

  const handleAssignmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const assignmentId = e.target.value
    if (!assignmentId) {
      setNewEvent((prev) => ({
        ...prev,
        assignmentId: undefined,
        assignmentTitle: undefined,
      }))
      return
    }

    const assignment = assignments.find((a) => a.id === assignmentId)
    setNewEvent((prev) => ({
      ...prev,
      assignmentId,
      assignmentTitle: assignment ? assignment.title : undefined,
    }))
  }

  const handleEventTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const eventType = e.target.value as "assignment" | "meeting" | "task" | "presentation" | "other"
    setNewEvent((prev) => ({
      ...prev,
      eventType,
      color: EVENT_COLORS[eventType],
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate that end time is after start time
    if (newEvent.end < newEvent.start) {
      alert("End time must be after start time")
      return
    }

    onSave({
      ...newEvent,
      userId, // ✅ include it
    } as CalendarEvent)
  }

  return (
    <div className="createEventModalOverlay">
      <div className="createEventModalContent">
        <div className="createEventModalHeader">
          <h2>Create New Event</h2>
          <button className="closeButton" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="createEventModalBody">
          <form onSubmit={handleSubmit} className="createEventForm">
            <div className="formGroup">
              <label htmlFor="title">Event Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={newEvent.title}
                onChange={handleInputChange}
                placeholder="Enter event title"
                required
              />
            </div>

            <div className="formGroup">
              <label htmlFor="eventType">Event Type</label>
              <select
                id="eventType"
                name="eventType"
                value={newEvent.eventType}
                onChange={handleEventTypeChange}
                required
              >
                <option value="meeting">Meeting</option>
                <option value="presentation">Presentation</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="formGroup">
              <label htmlFor="assignmentId">Related Assignment</label>
              <select
                id="assignmentId"
                name="assignmentId"
                value={newEvent.assignmentId || ""}
                onChange={handleAssignmentChange}
              >
                <option value="">None</option>
                {assignments.map((assignment) => (
                  <option key={assignment.id} value={assignment.id}>
                    {assignment.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="formRow">
              <div className="formGroup">
                <label htmlFor="startDate">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={newEvent.start instanceof Date && !isNaN(newEvent.start.getTime()) ? format(newEvent.start, "yyyy-MM-dd") : ""}
                  onChange={handleDateChange}
                  required
                />
              </div>

              <div className="formGroup">
                <label htmlFor="startTime">Start Time</label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  value={newEvent.start instanceof Date && !isNaN(newEvent.start.getTime()) ? format(newEvent.start, "HH:mm") : ""}
                  onChange={handleTimeChange}
                  required
                />
              </div>
            </div>

            <div className="formRow">
              <div className="formGroup">
                <label htmlFor="endDate">End Date</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={newEvent.end instanceof Date && !isNaN(newEvent.end.getTime()) ? format(newEvent.end, "yyyy-MM-dd") : ""}
                  onChange={handleDateChange}
                  required
                />
              </div>

              <div className="formGroup">
                <label htmlFor="endTime">End Time</label>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  value={newEvent.end instanceof Date && !isNaN(newEvent.end.getTime()) ? format(newEvent.end, "HH:mm") : ""}
                  onChange={handleTimeChange}
                  required
                />
              </div>
            </div>

            <div className="formGroup">
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={newEvent.location || ""}
                onChange={handleInputChange}
                placeholder="e.g. Zoom, Room 302, etc."
              />
            </div>

            <div className="formGroup">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={newEvent.description || ""}
                onChange={handleInputChange}
                rows={4}
                placeholder="Add details about this event..."
              />
            </div>

            <div className="formActions">
              <button type="button" className="cancelButton" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="saveButton">
                Create Event
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
