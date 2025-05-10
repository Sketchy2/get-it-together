"use client"

import type React from "react"
import "./AssignmentDetails.css"
import {
  X,
  Maximize2,
  Calendar,
  Weight,
  Flag,
  Clock,
  Edit,
  Plus,
} from "lucide-react"
import { useState, useRef, useEffect, useCallback, RefObject, ReactNode } from "react"
import ProgressCircle from "../common/ProgressCircle"
import { SortDirection, SortOption } from "@/types/auxilary"
import SortMenu from "../common/SortMenu"
import TaskCard from "../task/TaskCard"
import { Task, TaskStatus } from "@/types/task"
import {AssignmentLink, FileAttachment, User} from "@/types/assignment"
import { formatDate, isLate, useOnClickOutside } from "@/utils/utils"
import {  calculateProgress, getCardBgColor } from "@/utils/assignmentUtils"
import FilesLinksSection from "./FilesLinksSection"
import TaskFilter from "../task/TaskFilter"
import ActionButton from "../common/ActionButton"

interface AssignmentDetailsProps {
  id: string
  title: string
  createdAt: string
  deadline: string
  weighting: number
  description: string
  files?: FileAttachment[]
  links?: AssignmentLink[]
  tasks: Task[]
  members?: User[] 

  isFormOpen:boolean
  onClose: () => void
  onTaskDelete:(taskId: string) => void
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void
  openTaskForm: (task?:Task) => void
  onExpand: () => void
  actionButtonRef?: RefObject<HTMLDivElement|null> // Added ref for the action button
  }

// TODO: CHANGE SO PASSES ASSIGNMENTOPBJECT
const AssignmentDetailPanel: React.FC<AssignmentDetailsProps> = ({
  id,
  title,
  description,
  createdAt,
  deadline,
  weighting,
  members,
  tasks,
  files = [],
  links = [],

  onClose,
  onTaskDelete,
  onTaskUpdate,
  isFormOpen,
  openTaskForm,
  onExpand,actionButtonRef
}) => {
  const sortOptions:SortOption[] = [
    { key: "deadline", label: "Due Date", icon: <Calendar size={16} /> },
    { key: "createdAt", label: "Created Date", icon: <Clock size={16} /> },
    { key: "weighting", label: "weighting", icon: <Weight size={16} /> },
    { key: "priority", label: "Priority", icon: <Flag size={16} /> },
  ] as const;



  const progress: number = calculateProgress(tasks);
  const islate: boolean = isLate(deadline);
  const bgColor: string = getCardBgColor(tasks,deadline)
  
  const [isEditing, setIsEditing] = useState(false)
  const [editedDescription, setEditedDescription] = useState(description)
  const [showFiles, setShowFiles] = useState(false)
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false)
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>(sortOptions[0])
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

const taskStatusChange = (taskId:string,newStatus:TaskStatus)=>{
  onTaskUpdate(taskId,{status:newStatus})
}

  const handleSortChange = (sortType: SortOption) => {
    if (sortBy.key === sortType.key) {
      // Toggle direction if same sort type
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(sortType);
      setSortDirection("asc");
    }
  };


  const [filters, setFilters] = useState({
    status: [] as string[],
    priority: [] as string[],
    deadline: "all" as "all" | "today" | "week" | "month",
  })

  const filterMenuRef = useRef<HTMLDivElement>(null)




  const handleSaveDescription = () => {
    // In a real app, this would save to the backend
    setIsEditing(false)
    // You would call onUpdate here with the new description
  }

  const toggleFilterMenu = () => {
    setIsFilterMenuOpen(!isFilterMenuOpen)
    setIsSortMenuOpen(false)
  }

  const toggleSortMenu = () => {
    setIsSortMenuOpen(!isSortMenuOpen)
    setIsFilterMenuOpen(false)
  }


  //TODO: CONDENSE FILTER AND SORT FUNCTIONS IN ONE LOCATION
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


  const filteredAndSortedTodos = applyFiltersAndSort(tasks)
  const mainPanelRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(mainPanelRef, (event) => {
    // Don't close if any modal is open
    if (isFormOpen) return;
    
    // Don't close if click was on the action button
    if (actionButtonRef && actionButtonRef.current && 
        actionButtonRef.current.contains(event.target as Node)) {
      return;
    }
    
    onClose();
  });


  return (
    <div ref={mainPanelRef} className="assignmentDetails">
      <div className="detailsHeader" style={{ backgroundColor: bgColor }}>
        <div className="headerContent">
          <h2 className="detailsTitle">{title}</h2>
          <div className="detailsMetaRow">
            <span className="detailsMeta">
              Due: {formatDate(deadline)} | Weighed: {weighting}%
            </span>
            <div className="statusIndicator">
              <span>{islate ? "Overdue" : progress === 100 ? "Completed" : "In Progress"}</span>
            </div>
          </div>
        </div>
        <button className="expandViewButton" onClick={onExpand} title="Expand to full view">
          <Maximize2 size={20} />
        </button>
        <button className="closeButton" onClick={onClose}>
          <X size={24} />
        </button>
        <ProgressCircle percentage={progress} />
      </div>

      <div className="detailsContent">
        <div className="detailsSection">
          <div className="sectionHeader">
            <h3 className="sectionTitle">Description</h3>
          </div>
          <p className="descriptionText">{description}</p>

          {/* {isEditing ? (
            <div className="editDescriptionContainer">
              <textarea
                className="descriptionTextarea"
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                rows={4}
              />
              <div className="editActions">
                <button className="cancelEditButton" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
                <button className="saveEditButton" onClick={handleSaveDescription}>
                  Save
                </button>
              </div>
            </div>
          ) : (
            <p className="descriptionText">{description}</p>
          )} */}
        </div>

        <div className="detailsSection">
          <FilesLinksSection 
          showFiles={showFiles} 
          setShowFiles={setShowFiles}
          files={files}
          links={links}
          
          />
        </div>

        <div className="detailsSection">
          <div className="sectionHeader">
            <h3 className="sectionTitle">Tasks</h3>
            <div className="sectionActions">
              <div className="filterContainer" ref={filterMenuRef}>
                <TaskFilter 
                filters={filters} 
                onChange={handleFilterChange} 
                isOpen={isFilterMenuOpen} 
                toggleOpen={toggleFilterMenu}/>

              </div>
                        <SortMenu
                          sortMenuOpen={isSortMenuOpen}
                          setSortMenuOpen={toggleSortMenu}
                          sortBy={sortBy}
                          sortDirection={sortDirection}
                          handleSortChange={handleSortChange}
                          options = {sortOptions}
                        />


            </div>
          </div>

          <div className="todoList">
            {filteredAndSortedTodos.length > 0 ? (
              filteredAndSortedTodos.map((task) =>
                <TaskCard key={task.id} task={task} onDelete={onTaskDelete} onEdit={()=>openTaskForm(task)} onStatusChange={taskStatusChange} />)
              
  
            ) : (
              <div className="emptyTodoState">
                <p>No tasks added yet</p>
              </div>
            )}
             <button className="addTaskButton" onClick={()=>openTaskForm()}>
              <Plus size={18} />
              <span>Add New Task</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssignmentDetailPanel
