
export type {Task,TaskStatus}

type Task = {
    id: string
    title: string
    description: string
    assignee?: string
    deadline?: string
    status: TaskStatus
    weight?: number
    createdAt?: string
    priority?: "low" | "medium" | "high"  
}


// todo - change to enums
type TaskStatus = "To-Do" | "In Progress" | "Completed"