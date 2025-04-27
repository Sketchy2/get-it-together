"use client"

import type React from "react"

import { useState } from "react"
import "./AssignmentModal.css"
import AssignmentDetails from "./AssignmentDetails"
import ExpandedAssignmentView from "./ExpandedAssignmentView"
import CreateTaskModal from "./CreateTaskModal"

interface AssignmentModalProps {
  isOpen: boolean
  assignment: any
  onClose: () => void
  onTodoToggle: (id: string) => void
  onTodoExpand: (id: string) => void
  onAddTodo: () => void
  onUpdate: (updatedAssignment: any) => void
}

const AssignmentModal: React.FC<AssignmentModalProps> = ({
  isOpen,
  assignment,
  onClose,
  onTodoToggle,
  onTodoExpand,
  onAddTodo,
  onUpdate,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false)

  if (!isOpen || !assignment) return null

  const handleExpandView = () => {
    setIsExpanded(true)
  }

  const handleCloseExpanded = () => {
    setIsExpanded(false)
  }

  const handleAddTodo = () => {
    setIsCreateTaskModalOpen(true)
  }

  const handleCreateTask = (newTask: any) => {
    // Create a new todo item from the task
    const newTodo = {
      id: newTask.id,
      text: newTask.title,
      description: newTask.description,
      completed: newTask.completed,
      expanded: false,
      assignee: newTask.assignee,
      dueDate: newTask.dueDate,
      weight: newTask.weight,
      priority: newTask.priority,
      status: newTask.status,
      createdAt: newTask.createdAt,
    }

    // Add the new todo to the assignment
    const updatedTodos = [...(assignment.todos || []), newTodo]
    const updatedAssignment = {
      ...assignment,
      todos: updatedTodos,
    }

    // Update the assignment
    onUpdate(updatedAssignment)
    setIsCreateTaskModalOpen(false)
  }

  if (isExpanded) {
    return (
      <ExpandedAssignmentView
        assignment={assignment}
        isOpen={isExpanded}
        onClose={handleCloseExpanded}
        onUpdate={onUpdate}
      />
    )
  }

  return (
    <div className="modalOverlay">
      <div className="modalContent">
        <AssignmentDetails
          id={assignment.id}
          title={assignment.title}
          date={assignment.date}
          dueDate={assignment.dueDate}
          weight={assignment.weight}
          description={assignment.description}
          progress={assignment.progress}
          daysRemaining={assignment.daysRemaining}
          isLate={assignment.isLate}
          bgColor={assignment.bgColor}
          todos={assignment.todos || []}
          onClose={onClose}
          onTodoToggle={onTodoToggle}
          onTodoExpand={onTodoExpand}
          onAddTodo={handleAddTodo}
          onExpand={handleExpandView}
          files={assignment.files || []}
        />
      </div>

      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        onSave={handleCreateTask}
        members={assignment.members || []}
        maxWeight={assignment.weight || 100}
        currentWeight={assignment.todos?.reduce((sum: number, todo: any) => sum + (todo.weight || 0), 0) || 0}
      />
    </div>
  )
}

export default AssignmentModal
