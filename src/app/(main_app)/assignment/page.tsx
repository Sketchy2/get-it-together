"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import "./assignment.css";
import { isLate } from "@/utils/utils";
import AssignmentRow from "@/components/assignment/AssignmentRow";
import AssignmentCard from "@/components/assignment/AssignmentCard";
import AssignmentOverlay from "@/components/assignment/AssignmentOverlay";
import CreateAssignmentModal from "@/components/assignment/CreateAssignmentModal";
import { PlusIcon, Calendar, Clock } from "lucide-react";
import ViewToggle from "@/components/common/ViewToggle";
import { SortOption, SortDirection, ViewMode } from "@/types/auxilary";
import SortMenu from "@/components/common/SortMenu";
import { Task, TaskStatus } from "@/types/task";
import { Assignment } from "@/types/assignment";
import {
  calculateDaysRemaining,
  calculateProgress,
  getCardBgColor,
} from "@/utils/assignmentUtils";
import { AssignmentListSection } from "@/components/assignment/AssignmentListSection";
import { AssignmentListCard } from "@/components/assignment/AssignmentListCard";
import ActionButton from "@/components/common/ActionButton";
import CreateTaskModal from "@/components/task/CreateTaskModal";

// Define sort function outside the component to avoid hoisting issues
// TODO: ADJUST BASED ON PROVIDED
function sortAssignmentsList(
  assignmentList: Assignment[],
  sortType: SortOption,
  sortDir: SortDirection
): Assignment[] {
  return [...assignmentList].sort((a, b) => {
    if (sortType.key === "deadline") {
      const dateA = new Date(a.deadline).getTime();
      const dateB = new Date(b.deadline).getTime();
      return sortDir === "asc" ? dateA - dateB : dateB - dateA;
    } else {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortDir === "asc" ? dateA - dateB : dateB - dateA;
    }
  });
}

export default function Assignments() {
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

  // Managing view
  const viewOptions: ViewMode[] = [{ label: "Kanban" }, { label: "List" }];
  const [viewMode, setViewMode] = useState<ViewMode>(viewOptions[0]);
  const switchViewMode = (_: ViewMode) => {
    //ignore input and just toggle
    if (viewMode.label == viewOptions[0].label) {
      setViewMode(viewOptions[1]);
    } else {
      setViewMode(viewOptions[0]);
    }
  };

  // Managing sort
  const sortOptions: SortOption[] = [
    { key: "deadline", label: "Due Date", icon: <Calendar size={16} /> },
    { key: "createdAt", label: "Created At", icon: <Clock size={16} /> },
  ] as const;
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>(sortOptions[0]);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

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
      console.log("waddup");

      if (viewMode.label == "List") {
        setExpandedAssignment((prevId) => (prevId === id ? null : id));
        setSelectedAssignmentData(
          assignments.find((as) => as.id == id) || selectedAssignmentData
        );
        console.log(isModalOpen);
      } else {
        console.log(viewMode);
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
   * Handle creating new assignment
   */
  const handleCreateAssignment = useCallback(
    async (newAssignmentData: Assignment) => {
      try {
        const res = await fetch("/api/assignments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: newAssignmentData.title,
            description: newAssignmentData.description,
            weighting: newAssignmentData.weighting,
            deadline: newAssignmentData.deadline,
            status: "Not Started", // or other default
            progress: 0,
            finalGrade: null,
          }),
        });

        if (!res.ok) throw new Error("Failed to create assignment");

        const created = await res.json();
        setAssignments((prev) => [...prev, created]);
        setIsCreateModalOpen(false);
      } catch (err) {
        console.error(err);
        // optionally show toast here
      }
    },
    []
  );

  /**
   * Handle updating assignment
   */
  const handleUpdateAssignment = useCallback(
    async (assignID: string, updates: Partial<Assignment>) => {
      try {
        // Find the base assignment using assignID
        const base =
          selectedAssignmentData?.id === assignID
            ? selectedAssignmentData
            : assignments.find((a) => a.id === assignID);

        if (!base) throw new Error("Assignment not found");

        const updatedAssignment = {
          ...base,
          ...updates,
          id: assignID, // ensure ID is preserved
        };

        const res = await fetch(`/api/assignments/${assignID}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedAssignment),
        });

        if (!res.ok) throw new Error("Failed to update assignment");

        const updated = await res.json();

        setAssignments((prev) =>
          prev.map((assignment) =>
            assignment.id === updated.id ? updated : assignment
          )
        );

        if (selectedAssignmentData?.id === updated.id) {
          setSelectedAssignmentData(updated);
        }
      } catch (err) {
        console.error(err);
      }
    },
    [assignments, selectedAssignmentData]
  );

  const updateTask = useCallback(
    (taskId: string, updates: Partial<Task>) => {
      if (!selectedAssignmentData) {
        return;
      }

      setSelectedAssignmentData((prevData) => {
        if (!prevData) return null;

        const taskExists = prevData.tasks.some((t) => t.id === taskId);
        if (!taskExists) return prevData;

        //NOTE: Can probs just update the task itself with partials, rather than update via updating assignment lol
        const updatedTasks: Task[] = prevData.tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                ...updates,
              }
            : t
        );

        const updatedAssignment: Assignment = {
          ...prevData,
          tasks: updatedTasks,
        };

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

  // TODO: use handleUpdateAssignment to simply update the tasks existing in the assignment
  const deleteTask = useCallback(
    (taskId: string) => {
      if (!selectedAssignmentData) {
        return;
      }

      setSelectedAssignmentData((prevData) => {
        if (!prevData) return null;

        const taskExists = prevData.tasks.some((t) => t.id === taskId);
        if (!taskExists) return prevData;

        const updatedTasks = selectedAssignmentData.tasks.filter(
          (t) => t.id !== taskId
        );

        const updatedAssignment: Assignment = {
          ...prevData,
          tasks: updatedTasks,
        };

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

  // OLD FUNCTION | KEEPING JUST INCASE
  // const handleUpdateAssignment = useCallback(async (updatedAssignment: Assignment) => {
  //   try {
  //     const res = await fetch(`/api/assignments/${updatedAssignment.id}`, {
  //       method: "PUT",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(updatedAssignment),
  //     });

  //     if (!res.ok) throw new Error("Failed to update assignment");

  //     const updated = await res.json();

  //     setAssignments((prev) =>
  //       prev.map((assignment) => assignment.id === updated.id ? updated : assignment)
  //     );
  //     if (selectedAssignmentData?.id === updated.id) {
  //       setSelectedAssignmentData(updated);
  //     }
  //   } catch (err) {
  //     console.error(err);
  //   }
  // }, [selectedAssignmentData]);

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

  if (assignments.length == 0) {
    //TODO: STYLE THIS
    return (
      <div className="loadingContainer">
        <p>No assignments...</p>
        <p>Time to get working!</p>
        <div className="addCard" onClick={() => setIsCreateModalOpen(true)}>
          <PlusIcon size={24} />
          <span>Add Assignment</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="assignmentHeader">
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
            options={sortOptions}
          />

          <ViewToggle
            currentView={viewMode}
            onViewChange={switchViewMode}
            options={viewOptions}
          />
        </div>

        {/* todo: handle vert scroll on list view */}
        <div className="assignmentsContainer">
          {viewMode.label === "Kanban" ? (
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
                          deadline={assignment.deadline}
                          weighting={assignment.weighting}
                          description={assignment.description}
                          progress={calculateProgress(assignment.tasks)}
                          daysRemaining={calculateDaysRemaining(
                            assignment.deadline
                          )}
                          isLate={isLate(assignment.deadline)}
                          bgColor={getCardBgColor(
                            assignment.tasks,
                            assignment.deadline
                          )}
                        />
                      </div>
                    );
                  })}
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
                        <div key={assignment.id}>
                          <AssignmentListCard
                            assignment={assignment}
                            isExpanded={expandedAssignment === assignment.id}
                            onToggleExpand={() =>
                              handleListClick(assignment.id)
                            }
                            onViewDetails={() => handleCardClick(assignment)}
                          />
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
          )}
        </div>

        <ActionButton
          icon={<PlusIcon size={24} />}
          onclick={() => setIsCreateModalOpen(true)}
          tooltip="Create a New Assignment"
        />

        {/* /* TODO PROVIDE STATE OF ASSIGNMENT DETAILS USING USE CONTEXT */
        /* Display modal */}
        {selectedAssignmentData && (
          <AssignmentOverlay
            isOpen={isModalOpen}
            assignment={selectedAssignmentData} // should just pass the assignment
            onClose={handleCloseModal}
            onTaskUpdate={updateTask}
            onTaskDelete={deleteTask}
            onAssignmentUpdate={handleUpdateAssignment}
          />
        )}

        <CreateAssignmentModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleCreateAssignment}
          assignment={null}
        />
      </div>
    </>
  );
}
