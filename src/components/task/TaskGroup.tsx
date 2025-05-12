"use client"

import type React from "react"
import { useState } from "react"
import { ChevronDown, ChevronRight, PlusIcon } from "lucide-react"
import TaskCard from "@/components/task/TaskCard"
import type { Task, TaskStatus } from "@/types/task"
import { getCardBgColor } from "@/utils/assignmentUtils"
import "./TaskGroup.css"

interface TaskGroupProps {
  title: string
  tasks: Task[]
  viewMode: "kanban" | "list"
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void | Promise<void>
  onTaskDelete:(taskId: string) => void
  onCreateTask?: () => void
  assignmentDeadline?: string
}

const TaskGroup: React.FC<TaskGroupProps> = ({
  title,
  tasks,
  viewMode,
  onStatusChange,
  onTaskDelete,
  onCreateTask,
  assignmentDeadline,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Get color based on group title or assignment status
  const getGroupColor = () => {
    // If we have an assignment deadline, use the assignment color scheme
    if (assignmentDeadline) {
      return getCardBgColor(tasks, assignmentDeadline)
    }

    // Otherwise use the default color scheme
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
    <div className={`taskGroup ${viewMode} ${isCollapsed ? "collapsed" : ""}`}>
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
              <TaskCard
                task={task}
                onStatusChange={(newStatus) => onStatusChange(task.id, newStatus)}
                onEdit={(task) => {
                  // You can implement edit functionality here if needed
                }}
                onDelete={() => {
                  onTaskDelete(task.id)
                }}
              />
            </div>
          ))}

          {onCreateTask && (
            <div className="addTaskButton" onClick={onCreateTask}>
              <PlusIcon size={16} />
              <span>Add Task</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TaskGroup
