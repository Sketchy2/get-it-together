"use client"

import type React from "react"

import { useState } from "react"
import { X, Calendar, Clock, MapPin, Trash, Edit, Link } from "lucide-react"
import {format} from "date-fns/format"
import type { Assignment } from "@/types/assignment"
import "./EventModal.css"

interface CalendarEvent {
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
}

interface EventModalProps {
  isOpen: boolean
  event: CalendarEvent
  onClose: () => void
  onUpdate: (updatedEvent: CalendarEvent) => void
  onDelete: (eventId: string) => void
  assignments: Assignment[]
}

export default function EventModal({ isOpen, event, onClose, onUpdate, onDelete, assignments }: EventModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedEvent, setEditedEvent] = useState<CalendarEvent>(event)

  if (!isOpen) return null

  const formatDate = (date: Date) => {
    return format(date, "EEEE, MMMM d, yyyy")
  }

  const formatTime = (date: Date) => {
    return format(date, "h:mm a")
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setEditedEvent((prev) => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const date = new Date(value)

    if (name === "startDate") {
      const newStart = new Date(editedEvent.start)
      newStart.setFullYear(date.getFullYear(), date.getMonth(), date.getDate())
      setEditedEvent((prev) => ({ ...prev, start: newStart }))
    } else if (name === "endDate") {
      const newEnd = new Date(editedEvent.end)
      newEnd.setFullYear(date.getFullYear(), date.getMonth(), date.getDate())
      setEditedEvent((prev) => ({ ...prev, end: newEnd }))
    }
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const [hours, minutes] = value.split(":").map(Number)

    if (name === "startTime") {
      const newStart = new Date(editedEvent.start)
      newStart.setHours(hours, minutes)
      setEditedEvent((prev) => ({ ...prev, start: newStart }))
    } else if (name === "endTime") {
      const newEnd = new Date(editedEvent.end)
      newEnd.setHours(hours, minutes)
      setEditedEvent((prev) => ({ ...prev, end: newEnd }))
    }
  }

  const handleAssignmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const assignmentId = e.target.value
    const assignment = assignments.find((a) => a.id === assignmentId)

    setEditedEvent((prev) => ({
      ...prev,
      assignmentId,
      assignmentTitle: assignment ? assignment.title : undefined,
      color: getAssignmentColor(assignmentId),
    }))
  }

  const getAssignmentColor = (assignmentId: string) => {
    // Map assignment IDs to colors
    const colorMap: Record<string, string> = {
      a1: "#B55629",
      a2: "#DD992B",
      a3: "#647A67",
    }

    return colorMap[assignmentId] || "#3E4578"
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate(editedEvent)
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      onDelete(event.id)
    }
  }

  return (
    <div className="eventModalOverlay">
      <div className="eventModalContent">
        <div className="eventModalHeader" style={{ backgroundColor: event.color || "#3E4578" }}>
          <button className="closeButton" onClick={onClose}>
            <X size={20} />
          </button>
          {!isEditing ? (
            <>
              <h2 className="eventModalTitle">{event.title}</h2>
              {event.assignmentTitle && (
                <div className="eventAssignment">
                  <Link size={16} />
                  <span>Part of: {event.assignmentTitle}</span>
                </div>
              )}
            </>
          ) : (
            <h2 className="eventModalTitle">Edit Event</h2>
          )}
        </div>

        <div className="eventModalBody">
          {!isEditing ? (
            <div className="eventDetails">
              <div className="eventDetailItem">
                <Calendar size={18} />
                <div className="eventDetailContent">
                  <span className="eventDetailLabel">Date</span>
                  <span className="eventDetailValue">{formatDate(event.start)}</span>
                </div>
              </div>

              <div className="eventDetailItem">
                <Clock size={18} />
                <div className="eventDetailContent">
                  <span className="eventDetailLabel">Time</span>
                  <span className="eventDetailValue">
                    {formatTime(event.start)} - {formatTime(event.end)}
                  </span>
                </div>
              </div>

              {event.location && (
                <div className="eventDetailItem">
                  <MapPin size={18} />
                  <div className="eventDetailContent">
                    <span className="eventDetailLabel">Location</span>
                    <span className="eventDetailValue">{event.location}</span>
                  </div>
                </div>
              )}

              {event.description && (
                <div className="eventDescription">
                  <h3>Description</h3>
                  <p>{event.description}</p>
                </div>
              )}

              <div className="eventActions">
                <button className="eventActionButton edit" onClick={() => setIsEditing(true)}>
                  <Edit size={16} />
                  <span>Edit</span>
                </button>
                <button className="eventActionButton delete" onClick={handleDelete}>
                  <Trash size={16} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="eventForm">
              <div className="formGroup">
                <label htmlFor="title">Event Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={editedEvent.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="formGroup">
                <label htmlFor="assignmentId">Related Assignment</label>
                <select
                  id="assignmentId"
                  name="assignmentId"
                  value={editedEvent.assignmentId || ""}
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
                    value={format(editedEvent.start, "yyyy-MM-dd")}
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
                    value={format(editedEvent.start, "HH:mm")}
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
                    value={format(editedEvent.end, "yyyy-MM-dd")}
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
                    value={format(editedEvent.end, "HH:mm")}
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
                  value={editedEvent.location || ""}
                  onChange={handleInputChange}
                  placeholder="e.g. Zoom, Room 302, etc."
                />
              </div>

              <div className="formGroup">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={editedEvent.description || ""}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Add details about this event..."
                />
              </div>

              <div className="formActions">
                <button type="button" className="cancelButton" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
                <button type="submit" className="saveButton">
                  Save Changes
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
