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
  onAssignmentDelete:(assignmentId: string) => void
  onAssignmentUpdate: (assignmentId: string, updates: Partial<Assignment>) => void
  onTaskAdd: (text: string, dueDate?: string) => Promise<void>
}

export default function AssignmentOverlay({
  isOpen,
  assignment,
  onClose,
  onTaskDelete,
  onTaskUpdate,
  onAssignmentDelete,
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

  const handleSaveTask = async (title: string, deadline?: string) => {
    try {
      if (isEditTask) {
        // EDIT
        await onTaskUpdate(isEditTask.id, { title, deadline });
      } else {
        // NEW
        await onTaskAdd(title, deadline);
      }
      setModalError(null);
      setIsCreateTaskModalOpen(false);
      setIsEditTask(null);
    } catch (err: any) {
      console.error(err);
      setModalError(err.message || "Failed to save task");
    }
  };


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

  const handleDeleteAssignment = () =>{
    // GET confirmation that user wants to delete the assignment
    onAssignmentDelete(assignment.id)
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
          onAssignmentDelete={handleDeleteAssignment}
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
        onSave={(taskData) => handleSaveTask(taskData.title, taskData.deadline)}
        assignmentId ={assignment.id}
        maxWeight={assignment.weighting || 100}
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
