"use client"

import { useRef, useState } from "react"
import "./AssignmentOverlay.css"
import AssignmentDetailPanel from "./AssignmentDetailPanel"
import ExpandedAssignmentView from "./ExpandedAssignmentView"
import CreateTaskModal from "../task/CreateTaskModal"
import type { Assignment } from "@/types/assignment"
import type { Task } from "@/types/task"
import CreateAssignmentModal from "./CreateAssignmentModal"
import ActionButton from "../common/ActionButton"
import { Edit } from "lucide-react"

interface AssignmentOverlayProps {
  isOpen: boolean
  assignment: Assignment
  onClose: () => void
  onTaskDelete: (taskId: string) => void
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void
  onAssignmentUpdate: (assignmentId: string, updates: Partial<Assignment>) => void
  onTaskAdd: (text: string, dueDate?: string) => Promise<void>
}

export default function AssignmentOverlay({
  isOpen,
  assignment,
  onClose,
  onTaskDelete,
  onTaskUpdate,
  onAssignmentUpdate,
  onTaskAdd,
}: AssignmentOverlayProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false)
  const [isEditTask, setIsEditTask] = useState<Task | null>(null)
  const [isCreateAssignmentModalOpen, setIsCreateAssignmentModalOpen] = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)

  const actionButtonRef = useRef<HTMLDivElement>(null)

  const handleExpandView = () => {
    setIsExpanded(true)
  }

  const handleCloseExpanded = () => {
    setIsExpanded(false)
  }

  // Called when user submits the CreateTaskModal
  const handleCreateTask = async (text: string, dueDate?: string) => {
    console.log("About to create task:", { text, dueDate })
    try {
      await onTaskAdd(text, dueDate)
      setModalError(null)
      setIsCreateTaskModalOpen(false)
      setIsEditTask(null)
    } catch (err: any) {
      console.error("Add task error:", err)
      setModalError(err.message || "Failed to create task")
    }
  }

  // Open the task-creation modal, optionally pre-populating for edit
  const handleAddAssignmentTask = (taskEdited?: Task) => {
    if (taskEdited) {
      setIsEditTask(taskEdited)
    }
    setModalError(null)
    setIsCreateTaskModalOpen(true)
  }

  const handleEditAssignment = (editted: Assignment) => {
    setIsCreateAssignmentModalOpen(false)
    onAssignmentUpdate(assignment.id, { ...editted })
  }

  if (!isOpen || !assignment) return null

  return (
    <>
      {isExpanded ? (
        <ExpandedAssignmentView
          assignment={assignment}
          isOpen={isExpanded}
          onClose={onClose}
          onMinimise={handleCloseExpanded}
          onAssignmentUpdate={onAssignmentUpdate}
          onTaskDelete={onTaskDelete}
          onTaskUpdate={onTaskUpdate}
          openTaskForm={handleAddAssignmentTask}
        />
      ) : (
        <div className="modalOverlay">
          <div className="modalContent">
            <AssignmentDetailPanel
              {...assignment}
              onClose={onClose}
              onTaskDelete={onTaskDelete}
              onTaskUpdate={onTaskUpdate}
              openTaskForm={handleAddAssignmentTask}
              onExpand={handleExpandView}
              isFormOpen={isCreateTaskModalOpen || isCreateAssignmentModalOpen}
              actionButtonRef={actionButtonRef}
            />
          </div>
        </div>
      )}

      <div ref={actionButtonRef}>
        <ActionButton
          icon={<Edit size={16} />}
          onclick={() => setIsCreateAssignmentModalOpen(true)}
          tooltip="Edit Assignment"
          zIdx={3000}
        />
      </div>

      {/* Show any error from creating a task */}
      {modalError && (
        <div
          className="modalError"
          style={{ color: "red", textAlign: "center", margin: "8px 0" }}
        >
          {modalError}
        </div>
      )}

      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => {
          setIsCreateTaskModalOpen(false)
          setIsEditTask(null)
          setModalError(null)
        }}
        onSave={(taskData) =>
          // Use title and deadline from modal, not text/dueDate
          handleCreateTask(taskData.title, taskData.deadline)
        }
        members={assignment.members || []}
        maxWeight={assignment.weighting || 100}
        currentWeight={
          assignment.tasks
            ? assignment.tasks.reduce((sum, t) => sum + (t.weighting ?? 1), 0)
            : 0
        }
        task={isEditTask}
      />

      <CreateAssignmentModal
        isOpen={isCreateAssignmentModalOpen}
        onClose={() => {
          setIsCreateAssignmentModalOpen(false)
        }}
        onSave={handleEditAssignment}
        assignment={assignment}
      />
    </>
  )
}
