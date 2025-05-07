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
  onTaskDelete: (taskId: string)=> void
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void
  // onPartialTaskUpdate: <K extends keyof Task>(property: K) => (taskId: string, value: Task[K])=>void// might remove
  onAssignmentUpdate: (assignmentId: string, updates: Partial<Assignment>) => void
  // onPartialAssignmentUpdate: (updatedAssignment: any) => void
}



export default function AssignmentOverlay({
  isOpen,
  assignment,
  onClose,
  onTaskDelete,
  onTaskUpdate,
  // onPartialTaskUpdate, // migth remove
  onAssignmentUpdate,
}:AssignmentOverlayProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false)
  const [isEditTask, setIsEditTask] = useState<Task|null>(null)
  const [isEditAssignment, setIsEditAssignment] = useState(false)

  if (!isOpen || !assignment) return null

  const handleExpandView = () => {
    setIsExpanded(true)
  }

  const handleCloseExpanded = () => {
    setIsExpanded(false)
  }

  //todo: make so changes display faster
  const handleAddAssignmentTask = (taskEdited?:Task) => {
    if (taskEdited)
      {setIsEditTask(taskEdited);
        console.log(taskEdited)
      }
    setIsCreateTaskModalOpen(true)
  }

  const handleCreateTask = (newTask: Task) => {
    const updatedTasks = [...assignment.tasks, newTask];
    setIsCreateTaskModalOpen(false);


    onAssignmentUpdate(assignment.id,{tasks: updatedTasks});
  };

  //TODO: USE USE CONTEXT TO PASS UPDATE METHODS BETTER
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
                isTaskFormOpen={isCreateTaskModalOpen}
                 />
          </div>
        </div>
      )}
      
      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => {setIsCreateTaskModalOpen(false);setIsEditTask(null)}}
        onSave={handleCreateTask}
        members={assignment.members || []}
        maxWeight={assignment.weighting || 100}
        currentWeight={assignment.tasks.reduce((sum, task) => sum + (task.weighting ? task.weighting : 1), 0)}
        task ={isEditTask}
        
      />

      
    </>
  )}

 
