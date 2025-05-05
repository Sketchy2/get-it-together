"use client"

import type React from "react"

import { useState } from "react"
import "./AssignmentModal.css"
import AssignmentDetailPanel from "./AssignmentDetailPanel"
import ExpandedAssignmentView from "./ExpandedAssignmentView"
import CreateTaskModal from "../task/CreateTaskModal"
import { Assignment } from "@/types/assignment"
import { Task } from "@/types/task"

interface AssignmentModalProps {
  isOpen: boolean
  assignment: Assignment
  onClose: () => void
  onTodoToggle: (id: string) => void
  onAddTodo: () => void
  onUpdate: (updatedAssignment: any) => void
}

const AssignmentModal: React.FC<AssignmentModalProps> = ({
  isOpen,
  assignment,
  onClose,
  onTodoToggle,
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

  // const handleAddTodo = () => {
  //   setIsCreateTaskModalOpen(true)
  // }

  const handleCreateTask = (newTask: Task) => {
    // Create a new todo item from the task
    const newTodo = {
      id: newTask.id,
      text: newTask.title,
      description: newTask.description,
      expanded: false,
      assignee: newTask.assignee,
      deadline: newTask.deadline,
      weight: newTask.weight,
      priority: newTask.priority,
      status: newTask.status,
      createdAt: newTask.createdAt,
    }

    // Add the new todo to the assignment
    const updatedTodos = [...(assignment.tasks || []), newTodo]
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
  console.log(assignment.createdAt)

  return (
    <div className="modalOverlay">
      <div className="modalContent">
        <AssignmentDetailPanel
          id={assignment.id}
          title={assignment.title}
          createdAt={assignment.createdAt}
          deadline={assignment.deadline}
          weight={assignment.weight}
          description={assignment.description}
          files={assignment.files || []}

          tasks={assignment.tasks || []}
          onClose={onClose}
          onTodoToggle={onTodoToggle}
          // onTodoExpand={onTodoExpand}
          // onAddTodo={handleAddTodo}
          onExpand={handleExpandView}
        />
      </div>

      {/* TODO: fix */}
      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        onSave={handleCreateTask}
        members={assignment.members || []}
        maxWeight={assignment.weight || 100}
        currentWeight={assignment.tasks?.reduce((sum: number, todo: any) => sum + (todo.weight || 0), 0) || 0}
      />
    </div>
  )
}

export default AssignmentModal
