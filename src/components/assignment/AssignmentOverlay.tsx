"use client";

import type React from "react";

import { useRef, useState } from "react";
import "./AssignmentOverlay.css";
import AssignmentDetailPanel from "./AssignmentDetailPanel";
import ExpandedAssignmentView from "./ExpandedAssignmentView";
import CreateTaskModal from "../task/CreateTaskModal";
import { Assignment } from "@/types/assignment";
import { Task } from "@/types/task";
import CreateAssignmentModal from "./CreateAssignmentModal";
import ActionButton from "../common/ActionButton";
import { Edit } from "lucide-react";

interface AssignmentOverlayProps {
  isOpen: boolean;
  assignment: Assignment;
  onClose: () => void;
  onTaskDelete: (taskId: string) => void;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  // onPartialTaskUpdate: <K extends keyof Task>(property: K) => (taskId: string, value: Task[K])=>void// might remove
  onAssignmentUpdate: (
    assignmentId: string,
    updates: Partial<Assignment>
  ) => void;
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
}: AssignmentOverlayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [isEditTask, setIsEditTask] = useState<Task | null>(null);
  const [isCreateAssignmentModalOpen, setIsCreateAssignmentModalOpen] =
    useState(false);



  const actionButtonRef = useRef<HTMLDivElement>(null);
    const handleExpandView = () => {
    setIsExpanded(true);
  };

  const handleCloseExpanded = () => {
    setIsExpanded(false);
  };

  //todo: make so changes display faster
  const handleAddAssignmentTask = (taskEdited?: Task) => {
    if (taskEdited) {
      setIsEditTask(taskEdited);
      console.log(taskEdited);
    }
    setIsCreateTaskModalOpen(true);
  };

  const handleCreateTask = (newTask: Task) => {
    const updatedTasks = [...assignment.tasks, newTask];
    setIsCreateTaskModalOpen(false);

    onAssignmentUpdate(assignment.id, { tasks: updatedTasks });
  };


  const handleEditAssignment = (edittedAssignment: Assignment) => {
    setIsCreateAssignmentModalOpen(false);

    onAssignmentUpdate(assignment.id, { ...edittedAssignment });
  };
  if (!isOpen || !assignment) return null;

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
              isFormOpen={isCreateTaskModalOpen||isCreateAssignmentModalOpen}
              actionButtonRef={actionButtonRef}
            />

          </div>
        </div>
      )}
      <div ref={actionButtonRef}>      <ActionButton
        icon={<Edit size={16} />}
        onclick={() => setIsCreateAssignmentModalOpen(true)}
        tooltip="Edit Assignment"
        zIdx={3000}
      /></div>


      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => {
          setIsCreateTaskModalOpen(false);
          setIsEditTask(null);
        }}
        onSave={handleCreateTask}
        members={assignment.members || []}
        maxWeight={assignment.weighting || 100}
        currentWeight={
          assignment.tasks
            ? assignment.tasks.reduce(
                (sum, task) => sum + (task.weighting ? task.weighting : 1),
                0
              )
            : 0
        }
        task={isEditTask}
      />
      <CreateAssignmentModal
        isOpen={isCreateAssignmentModalOpen}
        onClose={() => {
          setIsCreateAssignmentModalOpen(false);
        }}
        onSave={handleEditAssignment}
        assignment={assignment}
      />
    </>
  );
}
