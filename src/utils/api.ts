import type { Task } from "@/types/task"
// utils/api.ts
export async function createTask(
    assignmentId: number,
    text: string,
    dueDate?: string
  ): Promise<Task> {
    const res = await fetch(`/api/assignments/${assignmentId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, dueDate }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to create task");
    }
    return res.json();
  }
  