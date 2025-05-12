// components/task/CreateTaskModal.tsx
"use client"

import React, { useEffect, useState } from "react"
import { Calendar, User, AlignLeft, Flag, HelpCircle, Clock, AlertTriangle, CheckCircle } from "lucide-react"
import "./CreateTaskModal.css"
import type { Task, TaskStatus } from "@/types/task"
import type { User as Member, Assignment as AsnType } from "@/types/assignment"
import FormItem from "../common/FormItem"
import FormRow from "../common/FormRow"
import Form from "../common/Form"

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (task: any) => void
  assignmentId?: string
  maxWeight: number
  // If in edit mode, pass the existing task
  task: Task | null
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  assignmentId: pinnedAssignmentId,
  task,
}) => {
  // form fields
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>(pinnedAssignmentId || "")
  const [availableMembers, setAvailableMembers] = useState<Member[]>([])
  const [assignee, setAssignee] = useState("")
  const [deadline, setDeadline] = useState("")
  const [weighting, setWeight] = useState(1)
  const [status, setStatus] = useState<TaskStatus>("To-Do")
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")
  const [assignments, setAssignments] = useState<AsnType[]>([])

  useEffect(() => {
        if (!isOpen) return
        fetch("/api/assignments")
          .then((res) => {
            if (!res.ok) throw new Error("Couldn’t load assignments")
            return res.json() as Promise<AsnType[]>
          })
          .then(setAssignments)
          .catch(console.error)
      }, [isOpen])

  // whenever the pinnedAssignmentId or user picks a new assignment, refresh the member list
  useEffect(() => {
    // find the assignment in our fetched list
    console.log("selected ID:", selectedAssignmentId)
    console.log(assignments)
    const asn = assignments.find((a) => a.id === selectedAssignmentId)
    console.log("asn:", asn)
    setAvailableMembers(asn?.members || [])
    // clear any previous assignee if they don’t exist in this new list
    if (!asn?.members.some((m) => m.id === assignee)) {
      setAssignee("")
    }
  }, [selectedAssignmentId, assignments])

  // prefill when editing
  useEffect(() => {
    if (isOpen && task) {
      setTitle(task.title)
      setDescription(task.description)
      setDeadline(task.deadline || "")
      setStatus(task.status)
      setPriority(task.priority || "medium")
      setSelectedAssignmentId(selectedAssignmentId)
      setAssignee(task.assignee?.[0]?.id || "")
    }
  }, [isOpen, task])

  if (!isOpen) return null

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setDeadline("")
    setWeight(1)
    setStatus("To-Do")
    setPriority("medium")
    setAssignee("")
    // don’t clear pinned assignment
    if (!pinnedAssignmentId) setSelectedAssignmentId("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newTask = {
      id: task?.id || `${Date.now()}`,
      title,
      description,
      assignmentId: selectedAssignmentId,
      assignee:    assignee ? [{ id: assignee, name: "" }] : undefined,
      deadline:    deadline || undefined,
      status,
      weighting,
      priority,
      createdAt:   new Date().toISOString(),
    }
    onSave(newTask)
    resetForm()
  }

  const getStatusIcon = (s: TaskStatus) => {
    switch (s) {
      case "To-Do":      return <Clock size={16} />
      case "In Progress": return <AlertTriangle size={16} />
      case "Completed":   return <CheckCircle size={16} />
      default:            return <HelpCircle size={16} />
    }
  }
  console.log("avilable members:", availableMembers)
  return (
    <Form
      onSave={handleSubmit}
      isOpen={isOpen}
      onClose={() => { resetForm(); onClose() }}
      formTitle={task ? "Edit Task" : "Create New Task"}
      formSubmitLabel={task ? "Save Changes" : "Create Task"}
      disabledCondition={!title || !selectedAssignmentId}
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

      <FormItem icon={<AlignLeft size={16} />} label="Description" htmlFor="taskDescription">
        <textarea
          id="taskDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter task description"
          rows={3}
        />
      </FormItem>

      <FormRow>
        {/* only show assignment picker if not pinned */}
        {!pinnedAssignmentId && (
          <FormItem label="Assignment" htmlFor="taskAssignment">
            <select
              id="taskAssignment"
              value={selectedAssignmentId}
              onChange={(e) => setSelectedAssignmentId(e.target.value)}
              required
            >
              <option value="">Select Assignment</option>
              {assignments.map((a) => (
                <option key={a.id} value={a.id}>{a.title}</option>
              ))}
            </select>
          </FormItem>
        )}

        <FormItem icon={<User size={16} />} label="Assignee" htmlFor="taskAssignee">
          <select
            id="taskAssignee"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
          >
            <option value="">Unassigned</option>
            {availableMembers.map((m) => (
              <option key={m.id} value={m.id}>{m.email}</option>
            ))}
          </select>
        </FormItem>

        <FormItem icon={<Calendar size={16} />} label="Due Date" htmlFor="taskDueDate">
          <input
            type="date"
            id="taskDueDate"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </FormItem>
      </FormRow>

      <FormRow>
        <FormItem icon={<Flag size={16} />} label="Priority" htmlFor="taskPriority">
          <div className="prioritySelector">
            {(["low", "medium", "high"] as const).map((level) => (
              <button
                key={level}
                type="button"
                className={`priorityButton ${priority === level ? "active" : ""}`}
                onClick={() => setPriority(level)}
              >
                <span className={`priorityDot ${level}`}></span>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </FormItem>

        <FormItem label="Initial Status" htmlFor="taskStatus">
          <div className="statusSelector">
            {(["To-Do", "In Progress", "Completed"] as TaskStatus[]).map((s) => (
              <button
                key={s}
                type="button"
                className={`statusButton ${status === s ? "active" : ""}`}
                onClick={() => setStatus(s)}
              >
                {getStatusIcon(s)} {s}
              </button>
            ))}
          </div>
        </FormItem>
      </FormRow>
    </Form>
  )
}

export default CreateTaskModal
