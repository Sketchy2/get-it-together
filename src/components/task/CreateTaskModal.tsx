"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Calendar, User, AlignLeft, Flag, HelpCircle, Clock, AlertTriangle, CheckCircle } from "lucide-react"
import "./CreateTaskModal.css"
import type { User as Member } from "@/types/assignment"
import type { Task, TaskStatus } from "@/types/task"
import FormItem from "../common/FormItem"
import FormRow from "../common/FormRow"
import Form from "../common/Form"

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (task: any) => void
  members: Member[]
  assignmentId: string
  maxWeight: number
  task: Task | null
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  members,
  task,
}) => {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [assignee, setAssignee] = useState("")
  const [deadline, setDeadline] = useState("")
  const [status, setStatus] = useState<TaskStatus>("To-Do")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")
  const [assignments, setAssignments] = useState<{ id: string; title: string }[]>([])
  const [assignmentId, setAssignmentId] = useState("")

  console.log("members in this selected: " + members)
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await fetch("/api/assignments")
        if (res.ok) {
          const data = await res.json()
          setAssignments(data)
        }
      } catch (error) {
        console.error("Error fetching assignments:", error)
      }
    }

    fetchAssignments()
  }, [isOpen])

  useEffect(() => {
    if (isOpen && task) {
      setTitle(task.title || "")
      setDescription(task.description || "")
      setAssignee(task.assignee?.[0]?.id || "")
      setDeadline(task.deadline || "")
      setStatus(task.status || "To-Do")
      setPriority(task.priority || "medium")
    }
  }, [isOpen, task])

  if (!isOpen) return null

  const handleClose = () => {
    resetForm()
    onClose()
  }
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newTask = {
      id: task?.id || `${Date.now()}`,
      title,
      description,
      assignee: assignee ? [{ id: assignee, name: assignee }] : undefined,
      deadline: deadline || undefined,
      status,
      priority,
      createdAt: new Date().toISOString(),
      assignmentId,
    }

    onSave(newTask)
    resetForm()
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setAssignee("")
    setDeadline("")
    setStatus("To-Do")
    setPriority("medium")
    setAssignmentId("")
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
    <Form
      onSave={handleSubmit}
      isOpen={isOpen}
      onClose={handleClose}
      formTitle={task ? "Edit Task" : "Create New Task"}
      formSubmitLabel={task ? "Edit Task" : "Create Task"}
      disabledCondition={!title || !assignmentId}
    >
      <FormItem label="Task Title" htmlFor="taskTitle">
        <input
          type="text"
          id="taskTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task title"
          required
        />
      </FormItem>

      <FormItem label="Description" htmlFor="taskDescription" icon={<AlignLeft size={16} />}>
        <textarea
          id="taskDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter task description"
          rows={3}
        />
      </FormItem>

      <FormRow>
        <FormItem label="Assignment" htmlFor="taskAssignment">
          <select
            id="taskAssignment"
            onChange={(e) => setAssignmentId(e.target.value)}
            required
          >
            <option value="">Select Assignment</option>
            {assignments.map((assignment) => (
              <option key={assignment.id} value={assignment.id}>
                {assignment.title}
              </option>
            ))}
          </select>
        </FormItem>
        <FormItem label="Assignee" htmlFor="taskAssignee" icon={<User size={16} />}>
          <select id="taskAssignee" value={assignee} onChange={(e) => setAssignee(e.target.value)}>
            <option value="">Unassigned</option>
            {members.map((member, index) => (
              <option key={index} value={member.email}>
                {member.email}
              </option>
            ))}
          </select>
        </FormItem>

        <FormItem label="Due Date" htmlFor="taskDueDate" icon={<Calendar size={16} />}>
          <input type="date" id="taskDueDate" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </FormItem>
      </FormRow>

      <FormRow>
        {/* <FormItem
    label={`Task weighting (Remaining: ${remainingWeight}%)`}
    htmlFor="taskWeight"
    icon={<Weight size={16} />}
  >
    <div className="weightInputContainer">
      <input
        type="range"
        id="taskWeight"
        min="1"
        max={Math.min(remainingWeight, 50)}
        value={weighting}
        onChange={(e) => setWeight(Number.parseInt(e.target.value))}
        className="weightSlider"
      />
      <span className="weightValue">{weighting}%</span>
    </div>
    <div className="weightDescription">
      {remainingWeight <= 0 ? (
        <span className="weightWarning">
          No weighting remaining for this assignment!
        </span>
      ) : (
        "Higher weighting means the task contributes more to overall progress"
      )}
    </div>
  </FormItem> */}

        <FormItem label="Priority" htmlFor="taskPriority" icon={<Flag size={16} />}>
          <div className="prioritySelector">
            {["low", "medium", "high"].map((level) => (
              <button
                key={level}
                type="button"
                className={`priorityButton ${priority === level ? "active" : ""}`}
                onClick={() => setPriority(level as "low" | "medium" | "high")}
              >
                <span className={`priorityDot ${level}`}></span>
                <span>{level.charAt(0).toUpperCase() + level.slice(1)}</span>
              </button>
            ))}
          </div>
        </FormItem>
      </FormRow>

      <FormItem label="Initial Status" htmlFor="taskStatus">
        <div className="statusSelector">
          {["To-Do", "In Progress", "Completed"].map((s) => (
            <button
              key={s}
              type="button"
              className={`statusButton ${status === s ? "active" : ""}`}
              onClick={() => setStatus(s as TaskStatus)}
            >
              {getStatusIcon(s as TaskStatus)}
              <span>{s}</span>
            </button>
          ))}
        </div>
      </FormItem>
    </Form>
  )
}

export default CreateTaskModal
