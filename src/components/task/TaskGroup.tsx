"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import TaskCard from "@/components/task/TaskCard"
import type { Task, TaskStatus } from "@/types/task"
import "./TaskGroup.css"

interface TaskGroupProps {
  title: string
  tasks: (Task & { assignmentId: string; assignmentTitle: string })[]
  viewMode: "kanban" | "list"
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void
}

export default function TaskGroup({ title, tasks, viewMode, onStatusChange }: TaskGroupProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Get color based on group title
  const getGroupColor = () => {
    if (title === "high" || title === "Overdue") return "#B55629"
    if (title === "medium" || title === "Today" || title === "This Week") return "#DD992B"
    if (title === "low" || title === "Next Week" || title === "Later") return "#647A67"
    if (title === "Completed") return "#647A67"
    return "#3E4578" // Default color for assignments
  }

  // Format title for display
  const getFormattedTitle = () => {
    if (title === "high") return "High Priority"
    if (title === "medium") return "Medium Priority"
    if (title === "low") return "Low Priority"
    return title
  }

  return (
    <div className={`taskGroup ${viewMode === "kanban" ? "kanbanGroup" : "listGroup"}`}>
      <div
        className="taskGroupHeader"
        style={{ backgroundColor: getGroupColor() }}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="taskGroupHeaderContent">
          <div className="taskGroupHeaderIcon">
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
          </div>
          <h3 className="taskGroupTitle">{getFormattedTitle()}</h3>
          <span className="taskGroupCount">{tasks.length}</span>
        </div>
      </div>

      {!isCollapsed && (
        <div className={`taskGroupContent ${viewMode === "kanban" ? "kanbanContent" : "listContent"}`}>
          {tasks.map((task) => (
            <div key={task.id} className="taskCardWrapper">
              <TaskCard task={task} onStatusChange={onStatusChange} />
              <div className="taskAssignmentBadge">{task.assignmentTitle}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
