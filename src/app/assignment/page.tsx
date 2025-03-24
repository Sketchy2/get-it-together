'use client';
import React, { useState } from 'react';
import './assignment.css';
import AssignmentRow from '@/components/assignment/AssignmentRow';
import AssignmentCard from '@/components/assignment/AssignmentCard';
import AssignmentModal from '@/components/assignment/AssignmentModal';
import { PlusIcon, FilterIcon, ArrowUpRightIcon, ChevronDownIcon, ChevronRightIcon, CheckSquareIcon } from 'lucide-react';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  expanded?: boolean;
}

interface Assignment {
  id: string;
  title: string;
  date: string;
  dueDate: string;
  weight: number;
  description: string;
  progress: number;
  daysRemaining: number;
  isLate: boolean;
  todos?: TodoItem[];
  bgColor?: string;
}

export default function Assignments() {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [expandedAssignment, setExpandedAssignment] = useState<string | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const sampleTodos: TodoItem[] = [
    { id: 't1', text: 'To do item 1', completed: false },
    { id: 't2', text: 'To do item 2', completed: true, expanded: true },
    { id: 't3', text: 'To do item 3', completed: false }
  ];
  
  const assignmentsByStatus = {
    active: [
      {
        id: '1',
        title: 'Late Assignment on Hover',
        date: 'Mar 15',
        dueDate: 'Mar 16',
        weight: 40,
        description: 'This is a late assignment that needs immediate attention. Please complete it as soon as possible.',
        progress: 50,
        daysRemaining: -1,
        isLate: true,
        todos: sampleTodos
      },
      {
        id: '2',
        title: 'Assignment on hover',
        date: 'Mar 15',
        dueDate: 'Mar 20',
        weight: 40,
        description: 'This assignment is due soon. Make sure to complete it before the deadline.',
        progress: 50,
        daysRemaining: 3,
        isLate: false,
        todos: sampleTodos
      },
      {
        id: '3',
        title: 'Assignment name',
        date: 'Mar 15',
        dueDate: 'Mar 25',
        weight: 40,
        description: 'Regular assignment with standard deadline.',
        progress: 40,
        daysRemaining: 8,
        isLate: false,
        todos: sampleTodos
      }
    ],
    completed: [
      {
        id: '4',
        title: 'Assignment not on hover',
        date: 'Mar 10',
        dueDate: 'Mar 15',
        weight: 40,
        description: 'This assignment has been completed successfully.',
        progress: 100,
        daysRemaining: 0,
        isLate: false,
        todos: sampleTodos
      }
    ]
  };

  const rows = [
    {
      id: 'active',
      title: 'Active',
      assignments: assignmentsByStatus.active,
      color: '#DD992B'  // Gold color
    },
    {
      id: 'completed',
      title: 'Completed',
      assignments: assignmentsByStatus.completed,
      color: '#647A67'  // Green color for completed items
    }
  ];

  const getCardBgColor = (assignment: Assignment, rowId: string) => {
    if (rowId === 'completed') {
      return '#647A67'; // Green color for completed items
    }
    if (assignment.isLate) {
      return '#900100';  // Red color for late assignments
    }
    return '#DD992B';  // Default gold color for active
  };

  const handleAssignmentClick = (id: string) => {
    if (viewMode === 'list') {
      if (expandedAssignment === id) {
        setExpandedAssignment(null);
      } else {
        setExpandedAssignment(id);
      }
    }
  };
  
  const handleCardClick = (assignment: Assignment) => {
    const assignmentWithColor = {
      ...assignment,
      bgColor: getCardBgColor(assignment, assignment.progress === 100 ? 'completed' : 'active')
    };
    setSelectedAssignment(assignmentWithColor);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAssignment(null);
  };
  
  const handleTodoToggle = (id: string) => {
    // Implementation for toggling todo item completion
    console.log('Toggle todo:', id);
  };
  
  const handleTodoExpand = (id: string) => {
    // Implementation for expanding/collapsing todo items
    console.log('Expand todo:', id);
  };
  
  const handleAddTodo = () => {
    // Implementation for adding a new todo item
    console.log('Add new todo');
  };

  return (
    <div className="assignmentsContainer">
      <header className="header">
        <h1 className="title">Assignments</h1>
        <div className="actions">
          <button className="iconButton">
            <FilterIcon size={20} />
          </button>
          <button className="iconButton">
            <ArrowUpRightIcon size={20} />
          </button>
          <div className="viewToggleContainer">
            <div className="viewToggle">
              <button 
                className={`viewButton ${viewMode === 'kanban' ? 'activeView' : ''}`}
                onClick={() => setViewMode('kanban')}
              >
                Kanban
              </button>
              <button 
                className={`viewButton ${viewMode === 'list' ? 'activeView' : ''}`}
                onClick={() => setViewMode('list')}
              >
                List
              </button>
            </div>
          </div>
        </div>
      </header>

      {viewMode === 'kanban' ? (
        // Kanban View
        <div className="rowsContainer">
          {rows.map(row => (
            <AssignmentRow 
              key={row.id} 
              title={row.title} 
              color={row.color}
            >
              {row.assignments.map(assignment => (
                <div key={assignment.id} onClick={() => handleCardClick(assignment)}>
                  <AssignmentCard
                    title={assignment.title}
                    date={assignment.date}
                    dueDate={assignment.dueDate}
                    weight={assignment.weight}
                    description={assignment.description}
                    progress={assignment.progress}
                    daysRemaining={assignment.daysRemaining}
                    isLate={assignment.isLate}
                    bgColor={getCardBgColor(assignment, row.id)}
                    width="230px"
                    height="180px"
                  />
                </div>
              ))}
            </AssignmentRow>
          ))}
        </div>
      ) : (
        // List View
        <div className="listContainer">
          {rows.map(row => (
            <div key={row.id} className="listSection">
              <div className="listSectionHeader" style={{ backgroundColor: row.color }}>
                <h2 className="listSectionTitle">{row.title}</h2>
              </div>
              <div className="listItems">
                {row.assignments.map(assignment => (
                  <div key={assignment.id}>
                    <div 
                      className={`listItem ${expandedAssignment === assignment.id ? 'expanded' : ''}`}
                      style={{ backgroundColor: getCardBgColor(assignment, row.id) }}
                      onClick={() => handleAssignmentClick(assignment.id)}
                    >
                      <div className="listItemIcon">
                        {expandedAssignment === assignment.id ? (
                          <ChevronDownIcon size={20} />
                        ) : (
                          <ChevronRightIcon size={20} />
                        )}
                      </div>
                      <div className="listItemContent">
                        <h3 className="listItemTitle">{assignment.title}</h3>
                        <div className="listItemMeta">
                          <span>{assignment.date} + day due | weightage {assignment.weight}%</span>
                        </div>
                      </div>
                      <div className="listItemProgress">
                        <div 
                          className="progressRing"
                          style={{ 
                            '--progress': assignment.progress 
                          } as React.CSSProperties}
                        >
                          <div className="progressValue">{assignment.progress}%</div>
                        </div>
                      </div>
                    </div>
                    
                    {expandedAssignment === assignment.id && (
                      <div className="listItemDetails" style={{ backgroundColor: getCardBgColor(assignment, row.id) }}>
                        <div className="listItemDescription">
                          <p>{assignment.description}</p>
                        </div>
                        <div className="todoItems">
                          <div className="todoItemHeader">
                            <FilterIcon size={16} />
                            <ArrowUpRightIcon size={16} />
                          </div>
                          <div className="todoItem">
                            <div className="todoItemCheckbox">
                              <CheckSquareIcon size={20} />
                            </div>
                            <span className="todoItemText">To do item</span>
                            <div className="todoItemProgressBars">
                              <div className="miniProgressBar"></div>
                              <div className="miniProgressBar"></div>
                              <div className="miniProgressBar"></div>
                            </div>
                            <div className="todoItemAvatar"></div>
                          </div>
                          <div className="todoItem">
                            <div className="todoItemCheckbox">
                              <ChevronRightIcon size={18} />
                              <CheckSquareIcon size={20} />
                            </div>
                            <span className="todoItemText">To do item</span>
                            <div className="todoItemProgressBars">
                              <div className="miniProgressBar"></div>
                              <div className="miniProgressBar"></div>
                              <div className="miniProgressBar"></div>
                            </div>
                            <div className="todoItemAvatar"></div>
                          </div>
                          <div className="todoItem">
                            <div className="addTodoButton" onClick={handleAddTodo}>
                              <PlusIcon size={18} />
                              <span>Add New Task</span>
                            </div>
                          </div>
                        </div>
                        <div className="detailsFooter">
                          <button 
                            className="viewFullButton"
                            onClick={() => handleCardClick(assignment)}
                          >
                            View Full Details
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="addButton">
        <PlusIcon size={24} />
      </button>
      
      <AssignmentModal 
        isOpen={isModalOpen}
        assignment={selectedAssignment}
        onClose={handleCloseModal}
        onTodoToggle={handleTodoToggle}
        onTodoExpand={handleTodoExpand}
        onAddTodo={handleAddTodo}
      />
    </div>
  );
}