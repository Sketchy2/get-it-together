import type {User} from "./assignment"
export type {Task,TaskStatus}


type Task = {   
    id: string
    title: string
    description: string
    assignee?: User[]
    dueDate?: string
    status: TaskStatus
    weighting?: number
    createdAt?: string
    priority?: "low" | "medium" | "high"  
}


// todo - change to enums
type TaskStatus = "To-Do" | "In Progress" | "Completed"