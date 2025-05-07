"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { X, Calendar, User, AlignLeft, Weight, Flag, HelpCircle, Clock, AlertTriangle, CheckCircle } from "lucide-react"
import "./CreateTaskModal.css"
import {  User as Member } from "@/types/assignment"
import {Task, TaskStatus} from "@/types/task"
import { useOnClickOutside } from "@/utils/utils"

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (task: any) => void
  members: Member[]
  maxWeight: number
  currentWeight: number
  task:Task | null
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  members,
  maxWeight,
  currentWeight,
  task
}) => {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [assignee, setAssignee] = useState( "") //look into multiple assignees
  const [deadline, setDeadline] = useState("")
  const [weighting, setWeight] = useState(1)
  const [status, setStatus] = useState<TaskStatus>("To-Do")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")

  //manage opening
  const menuRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(menuRef, onClose);

  console.log("We have prefilled with",task,title)
  // Calculate remaining weighting
  const remainingWeight = maxWeight - currentWeight


  useEffect(() => {
    if (isOpen && task) {
      setTitle(task.title || "")
      setDescription(task.description || "")
      setAssignee(task.assignee?.[0]?.id || "")
      setDeadline(task.deadline || "")
      setWeight(task.weighting || 1)
      setStatus(task.status || "To-Do")
      setPriority(task.priority || "medium")
    }
  }, [isOpen, task])

  if (!isOpen) return null

  const handleClose =()=>{
    resetForm()
    onClose()
  }
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newTask = {
      id: task?.id || `${Date.now()}`,
            title,
      description,
      assignee: assignee || undefined,
      deadline: deadline || undefined,
      status,
      weighting,
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
    setDeadline("")
    setWeight(1)
    setStatus("To-Do")
    setPriority("medium")
  }

  const getStatusIcon = (statusType: TaskStatus) => {
    switch (statusType) {

      case "To-Do":
        return <Clock size={16} />
      case "In Progress":
        return <AlertTriangle size={16} />
      case "Completed":
        return <CheckCircle size={16} />
      default:
        return <HelpCircle size={16} />
    }
  }

  return (
    <div className="taskModalOverlay">
      <div ref={menuRef} className="taskModalContent">
        <div className="taskModalHeader">
          <h3>{task?"Edit":"Create New"} Task</h3>
          <button className="closeButton" onClick={handleClose}>
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
                  <option key={index} value={member.name}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="formGroup">
              <label htmlFor="taskDueDate" className="inputWithIcon">
                <Calendar size={16} />
                <span>Due Date</span>
              </label>
              <input type="date" id="taskDueDate" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
          </div>

          <div className="formRow">
            <div className="formGroup">
              <label htmlFor="taskWeight" className="inputWithIcon">
                <Weight size={16} />
                <span>Task weighting (Remaining: {remainingWeight}%)</span>
              </label>
              <div className="weightInputContainer">
                <input
                  type="range"
                  id="taskWeight"
                  min="1"
                  max={Math.min(remainingWeight, 50)} // Limit to remaining weighting or 50, whichever is smaller
                  value={weighting}
                  onChange={(e) => setWeight(Number.parseInt(e.target.value))}
                  className="weightSlider"
                />
                <span className="weightValue">{weighting}%</span>
              </div>
              <div className="weightDescription">
                {remainingWeight <= 0 ? (
                  <span className="weightWarning">No weighting remaining for this assignment!</span>
                ) : (
                  "Higher weighting means the task contributes more to overall progress"
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
                className={`statusButton ${status === "To-Do" ? "active" : ""}`}
                onClick={() => setStatus("To-Do")}
              >
                {getStatusIcon("To-Do")}
                <span>To Do</span>
              </button>
              <button
                type="button"
                className={`statusButton ${status === "In Progress" ? "active" : ""}`}
                onClick={() => setStatus("In Progress")}
              >
                {getStatusIcon("In Progress")}
                <span>In Progress</span>
              </button>
              <button
                type="button"
                className={`statusButton ${status === "Completed" ? "active" : ""}`}
                onClick={() => setStatus("Completed")}
              >
                {getStatusIcon("Completed")}
                <span>Completed</span>
              </button>
            </div>
          </div>

          <div className="formActions">
            <button type="button" className="cancelButton" onClick={handleClose}>
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
