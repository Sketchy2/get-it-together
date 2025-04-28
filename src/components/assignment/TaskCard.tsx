"use client"

import type React from "react"
import { useState } from "react"
import {
  CheckCircle,
  Circle,
  User,
  Calendar,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Weight,
  Clock,
  Flag,
  Edit,
  Trash,
} from "lucide-react"
import "./TaskCard.css"
import { Task, TaskStatus } from "@/types/task"



interface TaskCardProps {
  task: Task
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onStatusChange }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [newComment, setNewComment] = useState("")

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  const toggleCompleted = () => {
    const newStatus = task.status == "Completed" ? "To-Do" : "Completed"
    onStatusChange(task.id, newStatus)
  }

  const handleStatusChange = (newStatus:TaskStatus) => {
    onStatusChange(task.id, newStatus)
    setIsMenuOpen(false)
  }

  // Determine the status color
  const getStatusColor = () => {
    if (task.status === "Completed") return "#647a67" // Green for completed
    if (task.status ===  "In Progress") return "#4d5696" // Purple for in progress
    if (task.status === "To-Do" ) return "#DD992B" // Gold for todo
    return "#777777" // Gray for unassigned
  }

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "No date set"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  // Get priority icon and color
  const getPriorityInfo = () => {
    switch (task.priority) {
      case "high":
        return { icon: <Flag size={14} className="priorityIcon high" />, label: "High Priority", color: "#e74c3c" }
      case "medium":
        return { icon: <Flag size={14} className="priorityIcon medium" />, label: "Medium Priority", color: "#f39c12" }
      case "low":
        return { icon: <Flag size={14} className="priorityIcon low" />, label: "Low Priority", color: "#3498db" }
      default:
        return { icon: <Flag size={14} className="priorityIcon" />, label: "Normal Priority", color: "#95a5a6" }
    }
  }

  const priorityInfo = getPriorityInfo()

  // Calculate days remaining or overdue
  const getDaysInfo = () => {
    if (!task.dueDate) return null

    const today = new Date()
    const dueDate = new Date(task.dueDate)
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return { text: `${Math.abs(diffDays)} days overdue`, isOverdue: true }
    } else if (diffDays === 0) {
      return { text: "Due today", isOverdue: false }
    } else if (diffDays === 1) {
      return { text: "Due tomorrow", isOverdue: false }
    } else {
      return { text: `${diffDays} days remaining`, isOverdue: false }
    }
  }

  const daysInfo = getDaysInfo()

  return (
    <div className={`taskCard ${task.status == "Completed" ? "completed" : ""} ${task.status} ${isExpanded ? "expanded" : ""}`}>
      {/* Main task infomation */}
      <div className="taskCardHeader">
        <button
          className="checkButton"
          onClick={toggleCompleted}
          aria-label={task.status == "Completed" ? "Mark as incomplete" : "Mark as complete"}
        >
          {task.status == "Completed" ? (
            <CheckCircle size={20} className="checkIcon completed" />
          ) : (
            <Circle size={20} className="checkIcon" />
          )}
        </button>

        <div className="taskTitleContainer">
          <h4 className={`taskTitle ${task.status == "Completed" ? "Completed" : ""}`}>  {task.title}</h4>
          <div className="taskBadges">
            <div className="taskStatusIndicator" style={{ backgroundColor: getStatusColor() }}>
              {task.status === "To-Do" && "To Do"}
              {task.status === "In Progress" && "In Progress"}
              {task.status === "Completed" && "Completed"}
            </div>
            {task.weight && task.weight > 1 && (
              <div className="taskWeightBadge">
                <Weight size={12} />
                <span>{task.weight}x</span>
              </div>
            )}
            {task.priority && (
              <div className="taskPriorityBadge" style={{ backgroundColor: priorityInfo.color }}>
                {priorityInfo.icon}
                <span>{task.priority}</span>
              </div>
            )}
          </div>
        </div>

        <div className="taskCardActions">
          <button
            className="expandButton"
            onClick={toggleExpanded}
            aria-label={isExpanded ? "Collapse task" : "Expand task"}
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          <div className="menuContainer">
            <button className="menuButton" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Task options">
              <MoreVertical size={18} />
            </button>

            {isMenuOpen && (
              <div className="menuDropdown">
                <button className="menuItem" onClick={() => handleStatusChange("To-Do")}>
                  <Clock size={14} />
                  <span>Move to To Do</span>
                </button>
                <button className="menuItem" onClick={() => handleStatusChange("In Progress")}>
                  <AlertTriangle size={14} />
                  <span>Move to In Progress</span>
                </button>
                <button className="menuItem" onClick={() => handleStatusChange("Completed")}>
                  <CheckCircle size={14} />
                  <span>Mark as Completed</span>
                </button>
                <div className="menuDivider"></div>
                <button className="menuItem">
                  <Edit size={14} />
                  <span>Edit Task</span>
                </button>
                <button className="menuItem delete">
                  <Trash size={14} />
                  <span>Delete Task</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>


      {isExpanded && (
        <div className="taskCardContent">
          {task.description && <p className="taskDescription">{task.description}</p>}

          <div className="taskDetailGrid">
            <div className="taskDetailItem">
              <div className="taskDetailLabel">
                <User size={14} />
                <span>Assignee</span>
              </div>
              <div className="taskDetailValue">
                {task.assignee ? (
                  <div className="assigneeInfo">
                    <div className="assigneeAvatar">{task.assignee.charAt(0).toUpperCase()}</div>
                    <span>{task.assignee}</span>
                  </div>
                ) : (
                  <span className="unassigned">Unassigned</span>
                )}
              </div>
            </div>

            <div className="taskDetailItem">
              <div className="taskDetailLabel">
                <Calendar size={14} />
                <span>Due Date</span>
              </div>
              <div className="taskDetailValue">
                {task.dueDate ? (
                  <div className="dueDateInfo">
                    <span>{formatDate(task.dueDate)}</span>
                    {daysInfo && (
                      <span className={`daysRemaining ${daysInfo.isOverdue ? "overdue" : ""}`}>{daysInfo.text}</span>
                    )}
                  </div>
                ) : (
                  <span className="noDueDate">No due date</span>
                )}
              </div>
            </div>

            <div className="taskDetailItem">
              <div className="taskDetailLabel">
                <Weight size={14} />
                <span>Weight</span>
              </div>
              <div className="taskDetailValue">
                <div className="weightInfo">
                  <div className="weightBar">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={`weightUnit ${i < (task.weight || 1) ? "active" : ""}`}
                        style={{ opacity: i < (task.weight || 1) ? 1 : 0.3 }}
                      ></div>
                    ))}
                  </div>
                  <span>
                    {task.weight || 1}x weight ({task.weight ? task.weight * 20 : 20}% of total)
                  </span>
                </div>
              </div>
            </div>

            <div className="taskDetailItem">
              <div className="taskDetailLabel">
                <Clock size={14} />
                <span>Created</span>
              </div>
              <div className="taskDetailValue">
                <span>{formatDate(task.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* mb keep if want to add commenting functionality
           {task.comments && task.comments.length > 0 && (
            <div className="taskComments">
              <div className="taskCommentsHeader">
                <MessageSquare size={14} />
                <span>Comments ({task.comments.length})</span>
              </div>
              <div className="commentsList">
                {task.comments.map((comment, index) => (
                  <div key={index} className="commentItem">
                    <div className="commentHeader">
                      <div className="commentAuthor">
                        <div className="commentAvatar">{comment.author.charAt(0).toUpperCase()}</div>
                        <span>{comment.author}</span>
                      </div>
                      <span className="commentDate">{formatDate(comment.date)}</span>
                    </div>
                    <p className="commentText">{comment.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )} */}

          <div className="addCommentForm">
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="commentInput"
            />
            <button className="commentButton" disabled={!newComment.trim()}>
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default TaskCard
