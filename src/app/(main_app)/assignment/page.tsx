"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import "./assignment.css"
import { isLate } from "@/utils/utils"
import AssignmentRow from "@/components/assignment/AssignmentRow"
import AssignmentCard from "@/components/assignment/AssignmentCard"
import AssignmentOverlay from "@/components/assignment/AssignmentOverlay"
import CreateAssignmentModal from "@/components/assignment/CreateAssignmentModal"
import { PlusIcon, Calendar, Clock } from "lucide-react"
import ViewToggle from "@/components/common/ViewToggle"
import type { SortOption, SortDirection, ViewMode } from "@/types/auxilary"
import SortMenu from "@/components/common/SortMenu"
import type { Task } from "@/types/task"
import type { Assignment } from "@/types/assignment"
import { calculateDaysRemaining, calculateProgress, getCardBgColor } from "@/utils/assignmentUtils"
import { AssignmentListSection } from "@/components/assignment/AssignmentListSection"
import { AssignmentListCard } from "@/components/assignment/AssignmentListCard"
import ActionButton from "@/components/common/ActionButton"
import toast, { Toaster } from "react-hot-toast"

// Define sort function outside the component to avoid hoisting issues
// TODO: ADJUST BASED ON PROVIDED
function sortAssignmentsList(assignmentList: Assignment[], sortType: SortOption, sortDir: SortDirection): Assignment[] {
  return [...assignmentList].sort((a, b) => {
    if (sortType.key === "deadline") {
      const dateA = new Date(a.deadline).getTime()
      const dateB = new Date(b.deadline).getTime()
      return sortDir === "asc" ? dateA - dateB : dateB - dateA
    } else {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return sortDir === "asc" ? dateA - dateB : dateB - dateA
    }
  })
}

export default function Assignments() {
  const [expandedAssignment, setExpandedAssignment] = useState<string | null>(null)
  const [selectedAssignmentData, setSelectedAssignmentData] = useState<Assignment | null>(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Managing view
  const viewOptions: ViewMode[] = [{ label: "Kanban" }, { label: "List" }]
  const [viewMode, setViewMode] = useState<ViewMode>(viewOptions[0])
  const switchViewMode = (_: ViewMode) => {
    //ignore input and just toggle
    if (viewMode.label == viewOptions[0].label) {
      setViewMode(viewOptions[1])
    } else {
      setViewMode(viewOptions[0])
    }
  }

  // Managing sort
  const sortOptions: SortOption[] = [
    { key: "deadline", label: "Due Date", icon: <Calendar size={16} /> },
    { key: "createdAt", label: "Created At", icon: <Clock size={16} /> },
  ] as const
  const [sortMenuOpen, setSortMenuOpen] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>(sortOptions[0])
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

  // Fetch all assignments

  useEffect(() => {
    const fetchAssignments = async () => {
      setIsLoading(true)
      try {
        const res = await fetch("/api/assignments")
        if (!res.ok) throw new Error("Failed to fetch assignments")
        // now the API returns exactly Assignment[], so just cast it:
        const data = (await res.json()) as Assignment[]
        console.log("Fetched assignments:", data)
        setAssignments(data)
        console.log("Assignments fetched:", data)
        setError(null)
      } catch (err) {
        console.error(err)
        setError("Failed to load assignments")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAssignments()
  }, [])

  /**
   * Get active assignments with memoization
   */
  const activeAssignments = useMemo(() => {
    const filtered = assignments.filter((assignment) => calculateProgress(assignment.tasks) < 100)
    return sortAssignmentsList(filtered, sortBy, sortDirection)
  }, [assignments, sortBy, sortDirection])

  /**
   * Get completed assignments with memoization
   */
  const completedAssignments = useMemo(() => {
    const filtered = assignments.filter((assignment) => calculateProgress(assignment.tasks) === 100)
    return sortAssignmentsList(filtered, sortBy, sortDirection)
  }, [assignments, sortBy, sortDirection])

  /**
   * Handle sort change
   */
  const handleSortChange = useCallback(
    (sortType: SortOption) => {
      if (sortBy.key == sortType.key) {
        // Toggle direction if same sort type

        setSortDirection((prev) => (prev == "asc" ? "desc" : "asc"))
      } else {
        setSortBy(sortType)
        setSortDirection("asc")
      }
      setSortMenuOpen(false)
    },
    [sortBy],
  )

  /**
   * Handle assignment click in list view
   */
  const handleListClick = useCallback(
    (id: string) => {
      if (viewMode.label == "List") {
        setExpandedAssignment((prevId) => (prevId === id ? null : id))
        setSelectedAssignmentData(assignments.find((as) => as.id == id) || selectedAssignmentData)
        console.log(isModalOpen)
      } else {
        console.log(viewMode)
      }
    },
    [assignments, selectedAssignmentData, viewMode],
  )

  /**
   * Handle assignment card click
   */
  const handleCardClick = useCallback((assignment: Assignment) => {
    setSelectedAssignmentData(assignment)
    setIsModalOpen(true)
  }, [])

  /**
   * Handle closing assignment modal
   */
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    // Use a timeout to prevent memory issues with large objects
    setTimeout(() => {
      // setSelectedAssignment(null);
      setSelectedAssignmentData(null)
    }, 300)
  }, [])

  /**
   * Handle creating new assignment
   */
  const handleCreateAssignment = useCallback(async (newAssignmentData: Assignment) => {
    try {
      const res = await toast.promise(fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newAssignmentData.title,
          description: newAssignmentData.description,
          weighting: newAssignmentData.weighting,
          deadline: newAssignmentData.deadline,
          status: "Not Started", 
          progress: 0,
          finalGrade: null,
          members: newAssignmentData.members ?? [],
        }),
      })
      , {
        loading: 'Creating assignment',
        success: 'Assignment created!',
        error: 'Error when creating assignment',
      });
      console.log('LOOK HERE', res)

      if (!res.ok) throw new Error("Failed to create assignment")

      const created = await res.json()
      setAssignments((prev) => [...prev, created])
      setIsCreateModalOpen(false)
    } catch (err) {
      console.error(err)
      // optionally show toast here
    }
  }, [])

const handleAddTask = useCallback(
  async (assignmentId: string, taskData: { text: string; dueDate?: string }) => {
    // 1) Build payload matching your POST handler
    const payload = {
      title:       taskData.text,
      description: null,        // or taskData.description if you collect one
      dueDate:     taskData.dueDate,
    };

    try {
      // 2) Send to your create-task endpoint
      const res = await toast.promise(fetch(`/api/assignments/${assignmentId}/tasks`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      })      , {
        loading: 'Adding task to assignment',
        success: 'Task created!',
        error: 'Error when creating Task',
      });

      if (!res.ok) {
        // Try JSON, then fallback to text
        let errorBody: any;
        try {
          errorBody = await res.json();
        } catch {
          errorBody = await res.text();
        }
        console.error(
          `Create task failed (status ${res.status}):`,
          errorBody
        );
        throw new Error(
          typeof errorBody === "object"
            ? errorBody.error || JSON.stringify(errorBody)
            : errorBody || "Unknown error"
        );
      }

      // 3) Parse the newly created Task
      const newTask = await res.json();
      console.log("New task created:", newTask);

      // 4) Merge into the assignments list
      setAssignments(prev =>
        prev.map(a =>
          a.id === assignmentId
            ? { ...a, tasks: [...a.tasks, newTask] }
            : a
        )
      );

      // 5) If this assignment is currently open, merge there too
      // if (selectedAssignmentData){
      //   setSelectedAssignmentData({...selectedAssignmentData,tasks: [...selectedAssignmentData.tasks, newTask]})
      // }
      setSelectedAssignmentData((prev) => {
        if (!prev || prev.id !== assignmentId) return prev;

        return {
          ...prev,
          tasks: [...(prev.tasks ?? []), newTask],
        };
      });

    } catch (err: any) {
      console.error("handleAddTask caught error:", err);
      // optionally surface to UI:
      setError(`Couldn’t add task: ${err.message}`);
      throw err;
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
          selectedAssignmentData?.id === assignID ? selectedAssignmentData : assignments.find((a) => a.id === assignID)

        if (!base) throw new Error("Assignment not found")

        const updatedAssignment = {
          ...base,
          ...updates,
          id: assignID, // ensure ID is preserved
        }

        const res = await toast.promise(fetch(`/api/assignments/${assignID}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedAssignment),
        }),    {
          loading: 'Updating assignment',
          success: 'Assignment updated!',
          error: 'Error when creating assignment',
        });

        if (!res.ok) throw new Error("Failed to update assignment")

        const updated = await res.json()

        setAssignments((prev) => prev.map((assignment) => (assignment.id === updated.id ? updated : assignment)))

        if (selectedAssignmentData?.id === updated.id) {
          setSelectedAssignmentData(updated)
        }
      } catch (err) {
        console.error(err)
      }
    },
    [assignments, selectedAssignmentData],
  )


  const handleDeleteAssignment = useCallback(
  async (assignID: string) => {
    try {
      const res = await toast.promise(
        fetch(`/api/assignments/${assignID}`, {
          method: "DELETE",
        }),
        {
          loading: "Deleting assignment...",
          success: "Assignment deleted!",
          error: "Failed to delete assignment",
        }
      );

      if (!res.ok) throw new Error("Failed to delete assignment");

      // Cleanup state
      handleCloseModal();
      setSelectedAssignmentData(null);
      setAssignments(prev =>
        prev.filter((assignment) => assignment.id !== assignID)
      );
    } catch (err) {
      console.error("Error deleting assignment:", err);
      setError("Could not delete assignment.");
    }
  },
  [assignments]
);

  const updateTask = useCallback(
  async (taskId: string, updates: Partial<Task>) => {
    if (!selectedAssignmentData) return;

    try {
      // 1. Send the update to your backend
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `Status ${res.status}`);
      }

      // 2. Get the saved task back
      const updatedTask: Task = await res.json();

      // 3. Merge it into both pieces of state
      setSelectedAssignmentData((prev) => {
        if (!prev) return null;
        const updatedTasks = prev.tasks.map((t) =>
          t.id === taskId ? updatedTask : t
        );
        const updatedAssignment = { ...prev, tasks: updatedTasks };
        setAssignments((all) =>
          all.map((a) => (a.id === updatedAssignment.id ? updatedAssignment : a))
        );
        return updatedAssignment;
      });
    } catch (err: any) {
      console.error("Failed to save task:", err);
      setError("Couldn’t save changes to the task.");
    }
  },
  [selectedAssignmentData]
);



  // TODO: use handleUpdateAssignment to simply update the tasks existing in the assignment
  const deleteTask = useCallback(
  async (taskId: string) => {
    if (!selectedAssignmentData) return;

    console.log("Attempting to delete task");

    try {
      const res = await toast.promise(
        fetch(`/api/tasks/${taskId}`, {
          method: "DELETE",
        }),
        {
          loading: "Deleting task...",
          success: "Task deleted!",
          error: "Failed to delete task",
        }
      );

      if (!res.ok) throw new Error("Task delete failed");

      // Update state after successful deletion
      setSelectedAssignmentData((prevData) => {
        if (!prevData) return null;

        const updatedTasks = prevData.tasks.filter((t) => t.id !== taskId);

        const updatedAssignment: Assignment = {
          ...prevData,
          tasks: updatedTasks,
        };

        setAssignments((prev) =>
          prev.map((a) => (a.id === updatedAssignment.id ? updatedAssignment : a))
        );

        return updatedAssignment;
      });
    } catch (err) {
      console.error("Error deleting task:", err);
      setError("Could not delete task.");
    }
  },
  [selectedAssignmentData]
);

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
    [activeAssignments, completedAssignments],
  )

  // TODO: make look cuter
  if (isLoading) {
    return (
      <div className="loadingContainer">
        <div className="loadingSpinner"></div>
        <p>Loading assignments...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="errorContainer">
        <div className="errorIcon">!</div>
        <h2>Error Loading Assignments</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    )
  }

  if (assignments.length== 0) {
    //TODO: STYLE THIS
    return (
      <><div className="loadingContainer">
        <h2>No assignments...</h2>
        <h3>Time to get working!</h3>
        <div className="addCard" onClick={() => setIsCreateModalOpen(true)}>
          <PlusIcon size={24} />
          <span>Add Assignment</span>
        </div>
      </div>
      
      <CreateAssignmentModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleCreateAssignment}
          assignment={null} /></>
    )
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

          <ViewToggle currentView={viewMode} onViewChange={switchViewMode} options={viewOptions} />
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
                      <div key={assignment.id} onClick={() => handleCardClick(assignment)}>
                        <AssignmentCard
                          title={assignment.title}
                          deadline={assignment.deadline}
                          weighting={assignment.weighting}
                          description={assignment.description}
                          progress={calculateProgress(assignment.tasks)}
                          daysRemaining={calculateDaysRemaining(assignment.deadline)}
                          isLate={isLate(assignment.deadline)}
                          bgColor={getCardBgColor(assignment.tasks, assignment.deadline)}
                        />
                      </div>
                    )
                  })}
                </AssignmentRow>
              ))}
            </div>
          ) : (
            //list view
            <div className="listContainer">
              {rows.map((row) => {
                return (
                  <AssignmentListSection key={row.id} title={row.title} color={row.color}>
                    {row.assignments.map((assignment) => {
                      return (
                        <div key={assignment.id}>
                          <AssignmentListCard
                            assignment={assignment}
                            isExpanded={expandedAssignment === assignment.id}
                            onToggleExpand={() => handleListClick(assignment.id)}
                            onViewDetails={() => handleCardClick(assignment)}
                          />
                        </div>
                      )
                    })}

                    <div className="addListItem" onClick={() => setIsCreateModalOpen(true)}>
                      <PlusIcon size={20} />
                      <span>Add New Assignment</span>
                    </div>
                  </AssignmentListSection>
                )
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
            assignment={selectedAssignmentData}
            onClose={handleCloseModal}
            onTaskUpdate={updateTask}
            onTaskDelete={deleteTask}
            onAssignmentUpdate={handleUpdateAssignment}
            onAssignmentDelete={handleDeleteAssignment}
            onTaskAdd={(text, dueDate) =>
              handleAddTask(selectedAssignmentData.id, { text, dueDate })
            }
          />
        )}


        <CreateAssignmentModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleCreateAssignment}
          assignment={null}
        />
              <Toaster />

      </div>
    </>
  )
}
