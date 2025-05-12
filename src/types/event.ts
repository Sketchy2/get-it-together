import type { Assignment } from "./assignment"


export type EventType = {
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
  eventType: "assignment" | "meeting" | "task" | "presentation" | "other"
}

export const EVENT_COLORS = {
  assignment: "#E74C3C", // Red for assignment due
  meeting: "#3498DB", // Blue for meetings
  task: "#2ECC71", // Green for task due
  presentation: "#F39C12", // Orange for presentations
  other: "#9B59B6", // Purple for others
}

export type EventWithAssignment = EventType & {
  assignment?: Assignment
}
