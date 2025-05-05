"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import "./assignment.css";
import {  isLate } from "@/utils/utils";
import AssignmentRow from "@/components/assignment/AssignmentRow";
import AssignmentCard from "@/components/assignment/AssignmentCard";
import AssignmentModal from "@/components/assignment/AssignmentModal";
import CreateAssignmentModal from "@/components/assignment/CreateAssignmentModal";
import {
  PlusIcon,
  Calendar,
  Clock,
} from "lucide-react";
import ViewToggle from "@/components/ViewToggle";
import { SortOption, SortDirection } from "@/types/sort";
import SortMenu from "@/components/SortMenu";
import { Task, TaskStatus } from "@/types/task";
import {
  Assignment,
  AssignmentLink,
  FileAttachment,
  User,
} from "@/types/assignment";
import {
  calculateDaysRemaining,
  calculateProgress,
  getCardBgColor,
} from "@/utils/assignmentUtils";
import { AssignmentListSection } from "@/components/assignment/AssignmentListSection";
import { AssignmentListCard } from "@/components/assignment/AssignmentListCard";

// View mode type
type ViewMode = "kanban" | "list";

// Define sort function outside the component to avoid hoisting issues
// TODO: ADJUST BASED ON PROVIDED
function sortAssignmentsList(
  assignmentList: Assignment[],
  sortType: SortOption,
  sortDir: SortDirection
): Assignment[] {
  return [...assignmentList].sort((a, b) => {
    if (sortType.key === "dueDate") {
      const dateA = new Date(a.dueDate).getTime();
      const dateB = new Date(b.dueDate).getTime();
      return sortDir === "asc" ? dateA - dateB : dateB - dateA;
    } else {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortDir === "asc" ? dateA - dateB : dateB - dateA;
    }
  });
}

export default function Assignments() {
  const sortOptions: SortOption[] = [
    { key: "dueDate", label: "Due Date", icon: <Calendar size={16} /> },
    { key: "createdAt", label: "Created At", icon: <Clock size={16} /> },
  ] as const;

  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [expandedAssignment, setExpandedAssignment] = useState<string | null>(
    null
  );
  const [selectedAssignmentData, setSelectedAssignmentData] =
    useState<Assignment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

  const [sortBy, setSortBy] = useState<SortOption>(sortOptions[0]);

  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const switchViewMode = () => {
    if (viewMode == "kanban") {
      setViewMode("list");
    } else {
      setViewMode("kanban");
    }
  };
  /**
   * Sample data generator function
   *
   * This provides mock data for development.
   * The structure matches what we expect from the backend API.
   */
  const getSampleAssignments = useCallback((): Assignment[] => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const lastWeek = new Date(now);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const members: User[] = [
      { id: "m1", name: "John Doe" },
      { id: "m2", name: "Jane Smith" },
      { id: "m3", name: "Alex Johnson" },
    ];

    const files: FileAttachment[] = [
      {
        id: "f1",
        name: "Research_Notes.pdf",
        size: 2500000,
        type: "application/pdf",
        uploadedAt: lastWeek.toISOString(),
      },
      {
        id: "f2",
        name: "Assignment_Requirements.docx",
        size: 1200000,
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        uploadedAt: lastWeek.toISOString(),
      },
    ];

    const tasks: Task[] = [
      {
        id: "t1",
        title: "Research topic",
        description: "Gather information from reliable sources",
        status: "To-Do",
        priority: "high",
        weight: 2,
        assignee: "m1",
        dueDate: nextWeek.toISOString(),
        createdAt: lastWeek.toISOString(),
      },
      {
        id: "t2",
        title: "Create outline",
        description: "Structure the document with main points",
        status: "Completed",
        priority: "medium",
        weight: 1,
        assignee: "m2",
        dueDate: yesterday.toISOString(),
        createdAt: lastWeek.toISOString(),
      },
      {
        id: "t3",
        title: "Write introduction",
        description: "Provide context and thesis statement",
        status: "In Progress",
        priority: "medium",
        weight: 3,
        assignee: "m1",
        dueDate: nextWeek.toISOString(),
        createdAt: lastWeek.toISOString(),
      },
    ];
    const links: AssignmentLink[] = [
      {
        title: "js destructuing",
        url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring",
      },
    ];

    return [
      {
        id: "a1",
        title: "Research Paper on Climate Change",
        description:
          "A comprehensive analysis of climate change factors and their global impact.",
        createdAt: lastWeek.toISOString(),
        dueDate: yesterday.toISOString(),
        weight: 40,
        members: members,
        tasks: tasks,
        files: files,
        links: links,
      },
      {
        id: "a2",
        title: "Literature Review",
        description:
          "Review of major works in the field with critical analysis.",
        createdAt: lastWeek.toISOString(),
        dueDate: nextWeek.toISOString(),
        weight: 30,
        members: [members[0], members[1]],
        tasks: tasks.slice(0, 2),
        files: files.slice(0, 1),
        links: [],
      },
      {
        id: "a3",
        title: "Group Presentation",
        description:
          "Prepare slides and talking points for the final presentation.",
        createdAt: lastWeek.toISOString(),
        dueDate: nextWeek.toISOString(),
        weight: 25,
        members: [members[2]],
        tasks: [tasks[0]],
        files: [],
        links: links,
      },
      {
        id: "a4",
        title: "Final Project Report",
        description: "Comprehensive documentation of the project results.",
        createdAt: yesterday.toISOString(),
        dueDate: lastWeek.toISOString(),
        weight: 50,
        members: members,
        tasks: tasks.map((task) => ({ ...task, status: "Completed" })),
        files: files,
        links: [],
      },
    ];
  }, []);

  // Fetch all assignments 

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/assignments");
        if (!res.ok) throw new Error("Failed to fetch assignments");
  
        const data = await res.json();
        setAssignments(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to load assignments. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchAssignments();
  }, []);
  

  /**
   * Get active assignments with memoization
   */
  const activeAssignments = useMemo(() => {
    const filtered = assignments.filter(
      (assignment) => calculateProgress(assignment.tasks) < 100
    );
    return sortAssignmentsList(filtered, sortBy, sortDirection);
  }, [assignments, sortBy, sortDirection]);

  /**
   * Get completed assignments with memoization
   */
  const completedAssignments = useMemo(() => {
    const filtered = assignments.filter(
      (assignment) => calculateProgress(assignment.tasks) === 100
    );
    return sortAssignmentsList(filtered, sortBy, sortDirection);
  }, [assignments, sortBy, sortDirection]);

  /**
   * Handle sort change
   */
  const handleSortChange = useCallback(
    (sortType: SortOption) => {
      if (sortBy.key == sortType.key) {
        // Toggle direction if same sort type

        setSortDirection((prev) => (prev == "asc" ? "desc" : "asc"));
      } else {
        setSortBy(sortType);
        setSortDirection("asc");
      }
      setSortMenuOpen(false);
    },
    [sortBy]
  );

  /**
   * Handle assignment click in list view
   */
  const handleListClick = useCallback(
    (id: string) => {
      if (viewMode === "list") {
        setExpandedAssignment((prevId) => (prevId === id ? null : id));
        setSelectedAssignmentData(assignments.find((as) => as.id == id) || selectedAssignmentData);
        console.log("handlings adding selected assignment");
        console.log(isModalOpen)
      }
    },
    [assignments, selectedAssignmentData, viewMode]
  );

  /**
   * Handle assignment card click
   */
  const handleCardClick = useCallback((assignment: Assignment) => {
    setSelectedAssignmentData(assignment);
    setIsModalOpen(true);
  }, []);

  /**
   * Handle closing assignment modal
   */
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    // Use a timeout to prevent memory issues with large objects
    setTimeout(() => {
      // setSelectedAssignment(null);
      setSelectedAssignmentData(null);
    }, 300);
  }, []);

  /**
   * Handle toggling task completion status
   */
  const handleTaskToggle = useCallback(
    (taskId: string) => {
      if (!selectedAssignmentData) {
        return;
      }

      setSelectedAssignmentData((prevData) => {
        if (!prevData) return null;

        // Find the task to toggle
        const task = prevData.tasks.find((t) => t.id === taskId);
        if (!task) return prevData;

        // Toggle the task status with proper typing
        const newStatus: TaskStatus =
          task.status === "Completed" ? "In Progress" : "Completed";

        // Update tasks array with explicit type
        const updatedTasks: Task[] = prevData.tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: newStatus,
                updatedAt: new Date().toISOString(),
              }
            : t
        );

        // Create updated assignment object
        const updatedAssignment: Assignment = {
          ...prevData,
          tasks: updatedTasks,
        };

        // Also update the assignments list
        setAssignments((prev) =>
          prev.map((a) =>
            a.id === updatedAssignment.id ? updatedAssignment : a
          )
        );

        return updatedAssignment;
      });
    },
    [selectedAssignmentData]
  );

  /**
   * Stable empty function for onAddTodo to prevent re-renders
   */
  const handleAddTodo = useCallback(() => {
    // Will be implemented later
    // should add todo to assignment and update view plus state
    console.log("Add todo clicked");
  }, []);

  /**
   * Handle creating new assignment
   */
  const handleCreateAssignment = useCallback(async (newAssignmentData: Assignment) => {
    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newAssignmentData.title,
          description: newAssignmentData.description,
          weighting: newAssignmentData.weight,
          deadline: newAssignmentData.dueDate,
          status: "Not Started", // or other default
          progress: 0,
          finalGrade: null,
        }),
      });
  
      if (!res.ok) throw new Error("Failed to create assignment");
  
      const created = await res.json();
      setAssignments(prev => [...prev, created]);
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error(err);
      // optionally show toast here
    }
  }, []);
  

  /**
   * Handle updating assignment
   */
  const handleUpdateAssignment = useCallback(async (updatedAssignment: Assignment) => {
    try {
      const res = await fetch(`/api/assignments/${updatedAssignment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedAssignment),
      });
  
      if (!res.ok) throw new Error("Failed to update assignment");
  
      const updated = await res.json();
  
      setAssignments((prev) =>
        prev.map((assignment) => assignment.id === updated.id ? updated : assignment)
      );
      if (selectedAssignmentData?.id === updated.id) {
        setSelectedAssignmentData(updated);
      }
    } catch (err) {
      console.error(err);
    }
  }, [selectedAssignmentData]);
  

  // Rows data for rendering
  const rows = useMemo(
    () => [
      {
        id: "active",
        title: "Active",
        assignments: activeAssignments,
        color: "#DD992B", // Gold color
      },
      {
        id: "completed",
        title: "Completed",
        assignments: completedAssignments,
        color: "#647A67", // Green color for completed items
      },
    ],
    [activeAssignments, completedAssignments]
  );

  // TODO: make look cuter
  if (isLoading) {
    return (
      <div className="loadingContainer">
        <div className="loadingSpinner"></div>
        <p>Loading assignments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="errorContainer">
        <div className="errorIcon">!</div>
        <h2>Error Loading Assignments</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <><header className="assignmentHeader">
      <h1 className="title">Assignments</h1>

    </header>
      <div className="mainContainer">
    <div className="actions">
        <SortMenu
          sortMenuOpen={sortMenuOpen}
          setSortMenuOpen={() => setSortMenuOpen(!sortMenuOpen)}
          sortBy={sortBy}
          sortDirection={sortDirection}
          handleSortChange={handleSortChange}
          options={sortOptions} />

        <ViewToggle viewMode={viewMode} onclick={switchViewMode} />
        </div>
        

        {/* todo: handle vert scroll on list view */}
      <div className="assignmentsContainer">


        {viewMode === "kanban" ? (
          // Kanban View
          <div className="rowsContainer">
            {rows.map((row) => (
              <AssignmentRow key={row.id} title={row.title} color={row.color}>
                {row.assignments.map((assignment) => {
                  return (
                    <div
                      key={assignment.id}
                      onClick={() => handleCardClick(assignment)}
                    >
                      <AssignmentCard
                        title={assignment.title}
                        dueDate={assignment.dueDate}
                        weight={assignment.weight}
                        description={assignment.description}
                        progress={calculateProgress(assignment.tasks)}
                        daysRemaining={calculateDaysRemaining(assignment.dueDate)}
                        isLate={isLate(assignment.dueDate)}
                        bgColor={getCardBgColor(
                          assignment.tasks,
                          assignment.dueDate
                        )} />
                    </div>
                  );
                })}
                <div
                  className="addCard"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  <PlusIcon size={24} />
                  <span>Add Assignment</span>
                </div>
              </AssignmentRow>
            ))}
          </div>
        ) : (
          //list view
          <div className="listContainer">
            {rows.map((row) => {
              return (
                <AssignmentListSection
                  key={row.id}
                  title={row.title}
                  color={row.color}
                >
                  {row.assignments.map((assignment) => {
                    return (
                      <div
                        key={assignment.id}
                      >
                        <AssignmentListCard
                          assignment={assignment}
                          isExpanded={expandedAssignment === assignment.id}
                          onToggleExpand={() => handleListClick(assignment.id)}
                          onViewDetails={() => handleCardClick(assignment)}
                          onStatusChange={handleTaskToggle} />
                      </div>
                    );
                  })}

                  <div
                    className="addListItem"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    <PlusIcon size={20} />
                    <span>Add New Assignment</span>
                  </div>
                </AssignmentListSection>
              );
            })}
          </div>
        )}</div>

        {
          /* //   // List View
            //   <div className="listContainer">
            //     {rows.map((row) => (
            //       <div key={row.id} className="listSection">
            //         <div
            //           className="listSectionHeader"
            //           style={{ backgroundColor: row.color }}
            //         >
            //           <h2 className="listSectionTitle">{row.title}</h2>
            //         </div>
            //         <div className="listItems">
            //           {row.assignments.map((assignment) =>
                  
            //           {
            //             const bgColor = getCardBgColor(assignment.tasks,assignment.dueDate)
            //             const progress = calculateProgress(assignment.tasks)
            //             return (
            //               <div key={assignment.id}>
            //                 <div
            //                   className={`listItem ${
            //                     expandedAssignment === assignment.id ? "expanded" : ""
            //                   }`}
            //                   style={{ backgroundColor: bgColor }}
            //                   onClick={() => handleListClick(assignment.id)}
            //                 >
            //                   {/* list heading */
          //                   <div className="listItemIcon">
          //                     {expandedAssignment === assignment.id ? (
          //                       <ChevronDownIcon size={20} />
          //                     ) : (
          //                       <ChevronRightIcon size={20} />
          //                     )}
          //                   </div>
          //                   <div className="listItemContent">
          //                     <h3 className="listItemTitle">{assignment.title}</h3>
          //                     <div className="listItemMeta">
          //                       <span>
          //                         {assignment.createdAt} + day due | weightage{" "}
          //                         {assignment.weight}%
          //                       </span>
          //                     </div>
          //                   </div>
          //                   <ProgressCircle percentage={progress} />
          //                 </div>
          //                 {expandedAssignment === assignment.id && (
          //                   <div
          //                     className="listItemDetails"
          //                     style={{ backgroundColor: bgColor }}
          //                   >
          //                     <div className="listItemDescription">
          //                       <p>{assignment.description}</p>
          //                     </div>
          //                     <div className="todoItems">
          //                       <div className="todoItemHeader">
          //                         <FilterIcon size={16} />
          //                         <ArrowUpRightIcon size={16} />
          //                       </div>
          //                       {assignment.tasks && assignment.tasks.length > 0 ? (
          //                         assignment.tasks.map((task) => (
          //                           <TaskCard key={task.id} task={task} onStatusChange={handleTaskToggle} />
          //                         ))
          //                       ) : (
          //                         <div className="emptyTodoState">
          //                           <p>No tasks added yet</p>
          //                         </div>
          //                       )}
          //                       {/* TODO fix so opens task creation module
          //                       <div className="todoItem">
          //                         <div
          //                           className="addTodoButton"
          //                           onClick={() => handleCardClick(assignment)}
          //                         >
          //                           <PlusIcon size={18} />
          //                           <span>Add New Task</span>
          //                         </div>
          //                       </div>*/}
          //                     </div>
          //                     <div className="detailsFooter">
          //                       <button
          //                         className="viewFullButton"
          //                         onClick={() => handleCardClick(assignment)}
          //                       >
          //                         View Full Details
          //                       </button>
          //                     </div>
          //                   </div>
          //                 )}
          //               </div>
          //             );
          //           }
          //           )}
          //           <div
          //             className="addListItem"
          //             onClick={() => setIsCreateModalOpen(true)}
          //           >
          //             <PlusIcon size={20} />
          //             <span>Add New Assignment</span>
          //           </div>
          //         </div>
          //       </div>
          //     ))}
          //   </div>
          // )}
        }

        {/* create assignment button */}
        <button
          className="floatingAddButton"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <PlusIcon size={24} />
        </button>

        {/* /* TODO PROVIDE STATE OF ASSIGNMENT DETAILS USING USE CONTEXT */
    /* Display modal */}
        {selectedAssignmentData && (
          <AssignmentModal
            isOpen={isModalOpen}
            assignment={selectedAssignmentData} // should just pass the assignment
            onClose={handleCloseModal}
            onTodoToggle={handleTaskToggle}
            onAddTodo={handleAddTodo}
            onUpdate={handleUpdateAssignment} />
        )}

        <CreateAssignmentModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleCreateAssignment} />
      </div></>
  );
}
