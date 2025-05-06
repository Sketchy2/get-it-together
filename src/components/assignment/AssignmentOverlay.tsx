"use client"

import type React from "react"

import { useState } from "react"
import "./AssignmentOverlay.css"
import AssignmentDetailPanel from "./AssignmentDetailPanel"
import ExpandedAssignmentView from "./ExpandedAssignmentView"
import CreateTaskModal from "../task/CreateTaskModal"
import { Assignment } from "@/types/assignment"
import { Task } from "@/types/task"

interface AssignmentOverlayProps {
  isOpen: boolean
  assignment: Assignment
  onClose: () => void
  onTodoToggle: (id: string) => void
  onUpdate: (updatedAssignment: any) => void
}

export default function AssignmentOverlay({
  isOpen,
  assignment,
  onClose,
  onTodoToggle,
  onUpdate,
}:AssignmentOverlayProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false)

  if (!isOpen || !assignment) return null

  const handleExpandView = () => {
    setIsExpanded(true)
  }

  const handleCloseExpanded = () => {
    setIsExpanded(false)
  }

  const handleAddAssignmentTask = () => {
    setIsCreateTaskModalOpen(true)
  }

  const handleCreateTask = (newTask: Task) => {
    const updatedTasks = [...assignment.tasks, newTask];
    setIsCreateTaskModalOpen(false);

    const updatedAssignment = {
      ...assignment,
      tasks: updatedTasks,
    };

    onUpdate(updatedAssignment);
  };

  return (
    <>
      {isExpanded ? (
        <ExpandedAssignmentView
          assignment={assignment}
          isOpen={isExpanded}
          onClose={onClose}
          onMinimise={handleCloseExpanded}
          onUpdate={onUpdate}
          onTaskAdd={handleAddAssignmentTask}
        />
      ) : (
        <div className="modalOverlay">
          <div className="modalContent">
            <AssignmentDetailPanel
              id={assignment.id}
              title={assignment.title}
              createdAt={assignment.createdAt}
              deadline={assignment.deadline}
              weighting={assignment.weighting}
              description={assignment.description}
              files={assignment.files || []}
              tasks={assignment.tasks || []}
              onClose={onClose}
              onTodoToggle={onTodoToggle}
              onAddTodo={handleAddAssignmentTask}
              onExpand={handleExpandView}
            />
          </div>
        </div>
      )}
      
      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        onSave={handleCreateTask}
        members={assignment.members || []}
        maxWeight={assignment.weighting || 100}
        currentWeight={assignment.tasks.reduce((sum, task) => sum + (task.weighting ? task.weighting : 1), 0)}
      />
    </>
  )}

 
