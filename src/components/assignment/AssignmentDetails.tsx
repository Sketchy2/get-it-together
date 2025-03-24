import React from 'react';
import './AssignmentDetails.css';
import { 
  X as CloseIcon, 
  Filter as FilterIcon, 
  ArrowUpRight as ArrowUpRightIcon,
  CheckSquare as CheckSquareIcon,
  ChevronRight as ChevronRightIcon,
  ChevronDown as ChevronDownIcon,
  Plus as PlusIcon
} from 'lucide-react';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  expanded?: boolean;
}

interface AssignmentDetailsProps {
  id: string;
  title: string;
  date: string;
  dueDate: string;
  weight: number;
  description: string;
  progress: number;
  daysRemaining: number;
  isLate: boolean;
  bgColor: string;
  todos: TodoItem[];
  onClose: () => void;
  onTodoToggle: (id: string) => void;
  onTodoExpand: (id: string) => void;
  onAddTodo: () => void;
}

const AssignmentDetails: React.FC<AssignmentDetailsProps> = ({
  id,
  title,
  date,
  dueDate,
  weight,
  description,
  progress,
  daysRemaining,
  isLate,
  bgColor,
  todos,
  onClose,
  onTodoToggle,
  onTodoExpand,
  onAddTodo
}) => {
  return (
    <div className="assignmentDetails">
      <div className="detailsHeader" style={{ backgroundColor: bgColor }}>
        <div className="headerContent">
          <h2 className="detailsTitle">{title}</h2>
          <div className="detailsMetaRow">
            <span className="detailsMeta">
              {date} + day due | weighing: {weight}%
            </span>
            <div className="statusIndicator">
              <span>In Progress</span>
            </div>
          </div>
        </div>
        <button className="closeButton" onClick={onClose}>
          <CloseIcon size={24} />
        </button>
        <div className="progressCircleContainer">
          <div className="progressCircle" style={{ '--progress': progress } as React.CSSProperties}>
            <div className="progressCircleInner">
              <span className="progressValue">{progress}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="detailsContent">
        <div className="detailsSection">
          <h3 className="sectionTitle">Description</h3>
          <p className="descriptionText">{description}</p>
        </div>

        <div className="detailsSection">
          <div className="sectionHeader">
            <h3 className="sectionTitle">To-Do Items</h3>
            <div className="sectionActions">
              <button className="actionButton">
                <FilterIcon size={18} />
              </button>
              <button className="actionButton">
                <ArrowUpRightIcon size={18} />
              </button>
            </div>
          </div>

          <div className="todoList">
            {todos.map(todo => (
              <div key={todo.id} className={`todoItem ${todo.completed ? 'completed' : ''}`}>
                <div className="todoItemHeader">
                  {todo.expanded ? (
                    <button className="expandButton" onClick={() => onTodoExpand(todo.id)}>
                      <ChevronDownIcon size={16} />
                    </button>
                  ) : (
                    <button className="expandButton" onClick={() => onTodoExpand(todo.id)}>
                      <ChevronRightIcon size={16} />
                    </button>
                  )}
                  <button 
                    className={`checkboxButton ${todo.completed ? 'completed' : ''}`}
                    onClick={() => onTodoToggle(todo.id)}
                  >
                    <CheckSquareIcon size={20} />
                  </button>
                  <span className={`todoText ${todo.completed ? 'completed' : ''}`}>
                    {todo.text}
                  </span>
                </div>
                <div className="todoItemActions">
                  <div className="progressBars">
                    <div className="miniProgressBar"></div>
                    <div className="miniProgressBar"></div>
                    <div className="miniProgressBar"></div>
                  </div>
                  <div className="avatarContainer">
                    <div className="avatar"></div>
                  </div>
                </div>
              </div>
            ))}
            <button className="addTodoButton" onClick={onAddTodo}>
              <PlusIcon size={18} />
              <span>Add New Task</span>
            </button>
          </div>
        </div>

        <div className="detailsSection">
          <div className="sectionHeader">
            <h3 className="sectionTitle">Polls</h3>
            <div className="pollTabs">
              <button className="pollTab active">Active Polls</button>
              <button className="pollTab">Completed Polls</button>
            </div>
          </div>
          <div className="pollContent">
            {/* Poll content will go here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentDetails;