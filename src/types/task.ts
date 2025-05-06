import type {User} from "./assignment"
export type {Task,TaskStatus}


type Task = {   
    id: string
    title: string
    description: string
    assignee?: User[]
    deadline?: string
    status: TaskStatus
    weighting?: number
    createdAt?: string
    priority?: "low" | "medium" | "high" |null
}


// todo - change to enums
type TaskStatus = "To-Do" | "In Progress" | "Completed"

type TaskPriority = "low" | "medium" | "high"  