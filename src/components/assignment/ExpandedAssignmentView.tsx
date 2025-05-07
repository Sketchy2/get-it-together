"use client";

import type React from "react";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  X,
  Plus,
  User as UserIcon,
  Paperclip,
  Calendar,
  LayoutGrid,
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  HelpCircle,
  BarChart,
  Edit,
  Flag,
  Minimize2,
} from "lucide-react";
import "./ExpandedAssignmentView.css";
import TaskCard from "../task/TaskCard";
import { DragDropContext } from "@hello-pangea/dnd";
import ProgressCircle from "../common/ProgressCircle";
import { TaskStatus, Task } from "@/types/task";
import { Assignment, User } from "@/types/assignment";
import { calculateProgress, getCardBgColor } from "@/utils/assignmentUtils";
import { SortDirection, SortOption } from "@/types/auxilary";
import SortMenu from "../common/SortMenu";
import { formatDate } from "@/utils/utils";

import TaskKanbanColumn from "../common/KanbanColumn";
import TaskFilter from "../task/TaskFilter";
import FilesLinksSection from "./FilesLinksSection";

interface ExpandedAssignmentViewProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimise: () => void;

  assignment: Assignment;
  onTaskDelete: (taskId: string) => void;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  openTaskForm: (task?: Task) => void;
  onAssignmentUpdate: (
    assignmentId: string,
    updates: Partial<Assignment>
  ) => void;
}

const ExpandedAssignmentView: React.FC<ExpandedAssignmentViewProps> = ({
  isOpen,
  onClose,
  onMinimise,
  assignment,
  onTaskDelete,
  onTaskUpdate,
  openTaskForm,
  onAssignmentUpdate,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [progress, setProgress] = useState(0);
  const [viewMode, setViewMode] = useState<"status" | "member">("status");
  const [memberProgress, setMemberProgress] = useState<Record<string, number>>(
    {}
  );
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: [] as string[],
    priority: [] as string[],
    deadline: "all" as "all" | "today" | "week" | "month",
  });
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const sortOptions: SortOption[] = [
    { key: "deadline", label: "Due Date", icon: <Calendar size={16} /> },
    { key: "createdAt", label: "Created At", icon: <Clock size={16} /> },
    { key: "weighting", label: "Weighting", icon: <BarChart size={16} /> },
    { key: "priority", label: "Priority", icon: <Flag size={16} /> },
  ] as const;

  const [sortBy, setSortBy] = useState<SortOption>(sortOptions[0]);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState("");
  const [showFiles, setShowFiles] = useState(false);

  if (!isOpen || !assignment) return null;

  const calcProgress = useCallback((taskList: Task[]) => {
    setProgress(calculateProgress(taskList));
  }, []);

  const members = useMemo(() => {
    return assignment.members ?? []
  }, [assignment.members]);

  const calculateMemberProgress = useCallback(
    (taskList: Task[]) => {
      const progressByMember: Record<string, number> = {};

      members.forEach((member) => {
        const memberTasks = taskList.filter((task) => {
          if (!Array.isArray(task.assignee) || task.assignee.length === 0) {
            return member.id === "undef"; //undef member id
          }
          return task.assignee.some((assignee) => assignee.id === member.id);
        });

        if (memberTasks.length === 0) {
          progressByMember[member.id] = 0;
          return;
        }

        const totalWeight = memberTasks.reduce(
          (sum, task) => sum + (task.weighting ?? 1),
          0
        );

        if (totalWeight === 0) {
          progressByMember[member.id] = 0;
          return;
        }

        const completedWeight = memberTasks
          .filter((task) => task.status === "Completed")
          .reduce((sum, task) => sum + (task.weighting ?? 1), 0);

        progressByMember[member.id] = Math.round(
          (completedWeight / totalWeight) * 100
        );
      });

      setMemberProgress(progressByMember);
    },
    [members]
  );


  const taskStatusChange = (taskId: string, newStatus: TaskStatus) => {
    onTaskUpdate(taskId, { status: newStatus });
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    // If dropped in the same place
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Find the task that was dragged
    const taskIndex = tasks.findIndex(
      (task) => String(task.id) === draggableId
    );
    if (taskIndex === -1) return;

    const draggedTask = tasks[taskIndex];

    // Create a new array without mutating the original
    const updatedTasks = [...tasks];

    // Update status or assignee based on destination and view mode
    let updatedTask: Task;

    if (viewMode === "status") {
      // Update the task status based on the destination column
      updatedTask = {
        ...draggedTask,
        status: destination.droppableId as TaskStatus,
      };
    } else {
      // In member view, we're updating the assignee
      if (destination.droppableId === "unassigned") {
        // Handling unassigned case
        updatedTask = {
          ...draggedTask,
          assignee: [], // Empty array for unassigned
        };
      } else {
        // Find the member by ID
        const member = members.find((m) => m.id === destination.droppableId);
        if (!member) return;

        // Determine if we need to create or update the assignee array
        let newAssignees;
        if (!Array.isArray(draggedTask.assignee)) {
          // Create new assignee array with just this member
          newAssignees = [member];
        } else {
          // Filter out any existing assignments to this member
          const existingAssignees = draggedTask.assignee.filter(
            (a) => a.id !== destination.droppableId
          );
          // Add this member to the assignees
          newAssignees = [...existingAssignees, member];
        }

        updatedTask = {
          ...draggedTask,
          assignee: newAssignees,
        };
      }
    }

    // Replace the task in our array
    updatedTasks[taskIndex] = updatedTask;

    // Update state
    setTasks(updatedTasks);
    calcProgress(updatedTasks);
    calculateMemberProgress(updatedTasks);

    // Update the parent component
    const updatedAssignment = {
      ...assignment,
      tasks: updatedTasks,
    };

    onAssignmentUpdate(updatedAssignment.id,updatedAssignment);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "To-do":
        return <Clock size={18} />;
      case "In Progress":
        return <AlertTriangle size={18} />;
      case "Completed":
        return <CheckCircle size={18} />;
      default:
        return <HelpCircle size={18} />;
    }
  };

  const toggleFilterMenu = () => {
    setIsFilterMenuOpen(!isFilterMenuOpen);
    setIsSortMenuOpen(false);
  };

  const toggleSortMenu = () => {
    setIsSortMenuOpen(!isSortMenuOpen);
    setIsFilterMenuOpen(false);
  };

  // TODO FIX FILTER
  type FilterKey = keyof typeof filters;

  const handleFilterChange = (type: string, value: string) => {
    if (!["status", "priority", "deadline"].includes(type)) return;

    const key = type as FilterKey;

    setFilters((prevFilters) => {
      const newFilters = { ...prevFilters };

      if (Array.isArray(newFilters[key])) {
        const currentArray = newFilters[key] as string[];
        if (currentArray.includes(value)) {
          newFilters[key] = currentArray.filter(
            (item) => item !== value
          ) as any;
        } else {
          newFilters[key] = [...currentArray, value] as any;
        }
      } else {
        newFilters[key] = value as any;
      }

      return newFilters;
    });
  };

  const handleSortChange = (sortType: SortOption) => {
    if (sortBy.key === sortType.key) {
      // Toggle direction if same sort type
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(sortType);
      setSortDirection("asc");
    }
  };
  const applyFiltersAndSort = useCallback(
    (taskList: Task[]) => {
      let filteredTasks = taskList;

      // Filter by status
      if (filters.status.length > 0) {
        filteredTasks = filteredTasks.filter((task) =>
          filters.status.includes(task.status)
        );
      }

      // Filter by priority
      if (filters.priority.length > 0) {
        filteredTasks = filteredTasks.filter((task) => {
          const priority = task.priority ?? "Unspecified";
          return filters.priority.includes(priority);
        });
      }

      // Filter by due date
      if (
        filters.deadline !== "all" &&
        filteredTasks.some((task) => task.deadline)
      ) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const weekLater = new Date(today);
        weekLater.setDate(today.getDate() + 7);

        const monthLater = new Date(today);
        monthLater.setMonth(today.getMonth() + 1);

        filteredTasks = filteredTasks.filter((task) => {
          if (!task.deadline) return false;

          const deadline = new Date(task.deadline);
          deadline.setHours(0, 0, 0, 0);

          if (filters.deadline === "today") {
            return deadline.getTime() === today.getTime();
          } else if (filters.deadline === "week") {
            return deadline >= today && deadline <= weekLater;
          } else if (filters.deadline === "month") {
            return deadline >= today && deadline <= monthLater;
          }
          return true;
        });
      }

      // Sort tasks
      return [...filteredTasks].sort((a, b) => {
        const key = sortBy.key;
        const dir = sortDirection === "asc" ? 1 : -1;

        // Handle undefined values
        if (key === "deadline") {
          if (!a.deadline && !b.deadline) return 0;
          if (!a.deadline) return dir;
          if (!b.deadline) return -dir;
          return (
            dir *
            (new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
          );
        }

        if (key === "weighting") {
          const aWeight = a.weighting ?? 0;
          const bWeight = b.weighting ?? 0;
          return dir * (aWeight - bWeight);
        }

        if (key === "priority") {
          const priorityOrder = { high: 3, medium: 2, low: 1, undefined: 0 };
          const aVal =
            priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          const bVal =
            priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          return dir * (aVal - bVal);
        }

        // Default sort for createdAt and other fields
        const aVal = a[key as keyof Task] as any;
        const bVal = b[key as keyof Task] as any;

        if (!aVal && !bVal) return 0;
        if (!aVal) return dir;
        if (!bVal) return -dir;

        return dir * (aVal > bVal ? 1 : aVal < bVal ? -1 : 0);
      });
    },
    [filters, sortBy, sortDirection]
  );




  // UPDATE LOGIC
  const handleSaveDescription = () => {

    onAssignmentUpdate(assignment.id,{description: editedDescription});
    setIsEditingDescription(false);
  };

  //DISPLAY METHODS
    const bgColor: string = getCardBgColor(assignment.tasks, assignment.deadline);

  const getTasksByStatus = useCallback(
    (status: string) => {
      return applyFiltersAndSort(
        tasks.filter((task) => task.status === status)
      );
    },
    [tasks, applyFiltersAndSort]
  );

  const getTasksByMember = useCallback(
    (member: User | null) => {
      if (member === null) {
        return applyFiltersAndSort(
          tasks.filter(
            (task) =>
              !Array.isArray(task.assignee) || task.assignee.length === 0
          )
        );
      }

      return applyFiltersAndSort(
        tasks.filter(
          (task) =>
            Array.isArray(task.assignee) &&
            task.assignee.some((assignee) => assignee.id === member.id)
        )
      );
    },
    [tasks, applyFiltersAndSort]
  );

  const statusColumns = useMemo(
    () =>
      ["To-Do", "In Progress", "Completed"].map((status) => {
        const statusTasks = getTasksByStatus(status);
        return {
          status,
          tasks: statusTasks,
          icon: getStatusIcon(status),
        };
      }),
    [getTasksByStatus]
  );

  const renderStatusView = () => (
    <div className="kanbanBoard">
      {statusColumns.map(({ status, tasks, icon }) => (
        <TaskKanbanColumn
          key={status}
          title={status}
          droppableId={status}
          items={tasks}
          headerContent={icon}
          renderItem={(task) => (
            <TaskCard
            key={task.id}
            task={task}
            onDelete={onTaskDelete}
            onEdit={() => openTaskForm(task)}
            onStatusChange={taskStatusChange}
          />
          )}
        />
      ))}
    </div>
  );

  const memberColumns = useMemo(() => {
    // Unassigned column
    // Member columns
    const memberColumnsData = members.map((member) => {
      const memberTasks = getTasksByMember(member);
      const progress = memberProgress[member.id] || 0;

      return {
        member,
        tasks: memberTasks,
        progress,
      };
    });

    return {
      members: memberColumnsData,
    };
  }, [getTasksByMember, assignment.members, memberProgress]);

  const renderMemberView = () => (
    <div className="kanbanBoard">
      <TaskKanbanColumn
        title="Unassigned"
        droppableId="unassigned"
        items={getTasksByMember(null)}
        headerContent={<HelpCircle size={16} />}
        renderItem={(task) => (
          <TaskCard
          key={task.id}
          task={task}
          onDelete={onTaskDelete}
          onEdit={() => openTaskForm(task)}
          onStatusChange={taskStatusChange}
        />
        )}
      />

      {memberColumns.members.map(({ member, tasks, progress }) => {
        return (
          <TaskKanbanColumn
            key={member.id}
            title={member.name}
            droppableId={member.id}
            items={tasks}
            headerContent={<div className="memberAvatar">{member.name[0]}</div>}
            footerContent={
              <div className="memberTaskStats">
                {["To-Do", "In Progress", "Completed"].map((status) => (
                  <div className="taskStatItem" key={status}>
                    <span className={`taskStatDot ${status}`}></span>
                    <span className="taskStatLabel">{status}:</span>
                    <span className="taskStatValue">
                      {tasks.filter((t) => t.status === status).length}
                    </span>
                  </div>
                ))}
                <div className="memberProgress">
                  <div
                    className="memberProgressBar"
                    style={{ width: `${progress}%` }}
                  ></div>
                  <span className="memberProgressText">{progress}%</span>
                </div>
              </div>
            }
            renderItem={(task) => (
              <TaskCard
                key={task.id}
                task={task}
                onDelete={onTaskDelete}
                onEdit={() => openTaskForm(task)}
                onStatusChange={taskStatusChange}
              />
            )}
          />
        );
      })}
    </div>
  );


  // REVIEW
  useEffect(() => {
    if (assignment && assignment.tasks) {
      setTasks(assignment.tasks);
      // calcProgress(assignment.tasks);
      // calculateMemberProgress(assignment.tasks);
    } else {
      setTasks([]);
    }

    // if (assignment) {
    //   setEditedDescription(assignment.description || "");
    // }
  }, [
    assignment,
    assignment.tasks,
    setTasks,
    calcProgress,
    calculateMemberProgress,
    setEditedDescription,
  ]);

  return (
    <div className="expandedViewOverlay">
      <div className="expandedViewContent">
        <div
          className="expandedViewHeader"
          style={{ backgroundColor: bgColor || "#DD992B" }}
        >
          <button className="backButton" onClick={onMinimise}>
            <Minimize2 size={24} />
          </button>
          <div className="headerContent">
            <h2 className="assignmentTitle">{assignment.title}</h2>
            <div className="assignmentMeta">
              {/* TODO: STEAL TAGS */}
              <div className="metaItem">
                <Calendar size={16} />
                <span>Due: {formatDate(assignment.deadline)}</span>
              </div>
              <div className="metaItem">
                <Paperclip size={16} />
                <span>{assignment.files?.length || 0} files</span>
              </div>
              <div className="metaItem">
                <UserIcon size={16} />
                <span>{assignment.members?.length || 0} members</span>
              </div>
              <div className="metaItem">
                <BarChart size={16} />
                <span>
                  {tasks.length} tasks (
                  {tasks.filter((t) => t.status === "Completed").length}{" "}
                  completed)
                </span>
              </div>
            </div>
          </div>
          <ProgressCircle percentage={progress} />

          <button className="closeButton" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="expandedViewBody">
          <div className="descriptionSection">
            <div className="sectionHeader">
              <h3 className="sectionTitle">Description</h3>
              <button
                className="editButton"
                onClick={() => setIsEditingDescription(!isEditingDescription)}
              >
                <Edit size={16} />
              </button>
            </div>

            {isEditingDescription ? (
              <div className="editDescriptionContainer">
                <textarea
                  className="descriptionTextarea"
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  rows={4}
                />
                <div className="editActions">
                  <button
                    className="cancelEditButton"
                    onClick={() => setIsEditingDescription(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="saveEditButton"
                    onClick={handleSaveDescription}
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <p className="descriptionText">{assignment.description}</p>
            )}
          </div>
          <div className="filesSection">
            <FilesLinksSection
              showFiles={showFiles}
              setShowFiles={setShowFiles}
              files={assignment.files}
              links={assignment.links}
            />
          </div>
          <div className="toolbarContainer">
            <div className="viewToggle">
              <button
                className={`viewToggleButton ${
                  viewMode === "status" ? "active" : ""
                }`}
                onClick={() => setViewMode("status")}
              >
                <LayoutGrid size={18} />
                <span>Status View</span>
              </button>
              <button
                className={`viewToggleButton ${
                  viewMode === "member" ? "active" : ""
                }`}
                onClick={() => setViewMode("member")}
              >
                <Users size={18} />
                <span>Member View</span>
              </button>
            </div>

            <div className="viewDescription">
              {viewMode === "status" ? (
                <p>Organize tasks by their current status</p>
              ) : (
                <p>View tasks assigned to each team member</p>
              )}
            </div>

            {/* task actions */}
            <div className="taskActions">
              {/* filter  */}
              <TaskFilter
                filters={filters}
                onChange={handleFilterChange}
                isOpen={isFilterMenuOpen}
                toggleOpen={toggleFilterMenu}
              />
              {/* sort */}
              <div className="sortContainer">
                <SortMenu
                  sortMenuOpen={isSortMenuOpen}
                  setSortMenuOpen={toggleSortMenu}
                  sortBy={sortBy}
                  sortDirection={sortDirection}
                  handleSortChange={handleSortChange}
                  options={sortOptions}
                />
              </div>

              {/* add task */}
              <button
                className="createTaskButton"
                onClick={() => openTaskForm()}
              >
                <Plus size={18} />
                <span>New Task</span>
              </button>
            </div>
          </div>

          {/* Kanban view */}
          <DragDropContext onDragEnd={handleDragEnd}>
            {viewMode === "status" ? renderStatusView() : renderMemberView()}
          </DragDropContext>
        </div>
      </div>
    </div>
  );
};

export default ExpandedAssignmentView;
