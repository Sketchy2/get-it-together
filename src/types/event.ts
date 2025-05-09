export type { EventType };

type EventType = {
  id: string;
  title: string;
  start: Date;
  end: Date;  
  allDay?: boolean;
  assignmentId?: string;
  assignmentTitle?: string;
  description?: string;
  location?: string;
  color?: string;
  eventType?: "assignment" | "meeting" | "task" | "presentation" | "other";
};
