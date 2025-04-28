"use client"

import type React from "react"
import { useState } from "react"
import { X, Calendar, User, AlignLeft, Weight, Flag, HelpCircle, Clock, AlertTriangle, CheckCircle } from "lucide-react"
import "./CreateTaskModal.css"

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (task: any) => void
  members: string[]
  maxWeight: number
  currentWeight: number
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  members,
  maxWeight,
  currentWeight,
}) => {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [assignee, setAssignee] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [weight, setWeight] = useState(1)
  const [status, setStatus] = useState<"unassigned" | "todo" | "inProgress" | "completed">("todo")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")

  // Calculate remaining weight
  const remainingWeight = maxWeight - currentWeight

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newTask = {
      id: `task-${Date.now()}`,
      title,
      description,
      assignee: assignee || undefined,
      dueDate: dueDate || undefined,
      completed: status === "completed",
      status,
      weight,
      priority,
      createdAt: new Date().toISOString(),
    }

    onSave(newTask)
    resetForm()
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setAssignee("")
    setDueDate("")
    setWeight(1)
    setStatus("todo")
    setPriority("medium")
  }

  const getStatusIcon = (statusType: string) => {
    switch (statusType) {
      case "unassigned":
        return <HelpCircle size={16} />
      case "todo":
        return <Clock size={16} />
      case "inProgress":
        return <AlertTriangle size={16} />
      case "completed":
        return <CheckCircle size={16} />
      default:
        return <HelpCircle size={16} />
    }
  }

  return (
    <div className="taskModalOverlay">
      <div className="taskModalContent">
        <div className="taskModalHeader">
          <h3>Create New Task</h3>
          <button className="closeButton" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="taskForm">
          <div className="formGroup">
            <label htmlFor="taskTitle">Task Title</label>
            <input
              type="text"
              id="taskTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              required
            />
          </div>

          <div className="formGroup">
            <label htmlFor="taskDescription" className="inputWithIcon">
              <AlignLeft size={16} />
              <span>Description</span>
            </label>
            <textarea
              id="taskDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description"
              rows={3}
            />
          </div>

          <div className="formRow">
            <div className="formGroup">
              <label htmlFor="taskAssignee" className="inputWithIcon">
                <User size={16} />
                <span>Assignee</span>
              </label>
              <select id="taskAssignee" value={assignee} onChange={(e) => setAssignee(e.target.value)}>
                <option value="">Unassigned</option>
                {members.map((member, index) => (
                  <option key={index} value={member}>
                    {member}
                  </option>
                ))}
              </select>
            </div>

            <div className="formGroup">
              <label htmlFor="taskDueDate" className="inputWithIcon">
                <Calendar size={16} />
                <span>Due Date</span>
              </label>
              <input type="date" id="taskDueDate" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>

          <div className="formRow">
            <div className="formGroup">
              <label htmlFor="taskWeight" className="inputWithIcon">
                <Weight size={16} />
                <span>Task Weight (Remaining: {remainingWeight}%)</span>
              </label>
              <div className="weightInputContainer">
                <input
                  type="range"
                  id="taskWeight"
                  min="1"
                  max={Math.min(remainingWeight, 50)} // Limit to remaining weight or 50, whichever is smaller
                  value={weight}
                  onChange={(e) => setWeight(Number.parseInt(e.target.value))}
                  className="weightSlider"
                />
                <span className="weightValue">{weight}%</span>
              </div>
              <div className="weightDescription">
                {remainingWeight <= 0 ? (
                  <span className="weightWarning">No weight remaining for this assignment!</span>
                ) : (
                  "Higher weight means the task contributes more to overall progress"
                )}
              </div>
            </div>

            <div className="formGroup">
              <label htmlFor="taskPriority" className="inputWithIcon">
                <Flag size={16} />
                <span>Priority</span>
              </label>
              <div className="prioritySelector">
                <button
                  type="button"
                  className={`priorityButton ${priority === "low" ? "active" : ""}`}
                  onClick={() => setPriority("low")}
                >
                  <span className="priorityDot low"></span>
                  <span>Low</span>
                </button>
                <button
                  type="button"
                  className={`priorityButton ${priority === "medium" ? "active" : ""}`}
                  onClick={() => setPriority("medium")}
                >
                  <span className="priorityDot medium"></span>
                  <span>Medium</span>
                </button>
                <button
                  type="button"
                  className={`priorityButton ${priority === "high" ? "active" : ""}`}
                  onClick={() => setPriority("high")}
                >
                  <span className="priorityDot high"></span>
                  <span>High</span>
                </button>
              </div>
            </div>
          </div>

          <div className="formGroup">
            <label htmlFor="taskStatus">Initial Status</label>
            <div className="statusSelector">
              <button
                type="button"
                className={`statusButton ${status === "unassigned" ? "active" : ""}`}
                onClick={() => setStatus("unassigned")}
              >
                {getStatusIcon("unassigned")}
                <span>Unassigned</span>
              </button>
              <button
                type="button"
                className={`statusButton ${status === "todo" ? "active" : ""}`}
                onClick={() => setStatus("todo")}
              >
                {getStatusIcon("todo")}
                <span>To Do</span>
              </button>
              <button
                type="button"
                className={`statusButton ${status === "inProgress" ? "active" : ""}`}
                onClick={() => setStatus("inProgress")}
              >
                {getStatusIcon("inProgress")}
                <span>In Progress</span>
              </button>
              <button
                type="button"
                className={`statusButton ${status === "completed" ? "active" : ""}`}
                onClick={() => setStatus("completed")}
              >
                {getStatusIcon("completed")}
                <span>Completed</span>
              </button>
            </div>
          </div>

          <div className="formActions">
            <button type="button" className="cancelButton" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="saveButton" disabled={!title || remainingWeight <= 0}>
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateTaskModal
