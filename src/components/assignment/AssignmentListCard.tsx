import { Assignment } from '@/types/assignment';
import { calculateProgress, getCardBgColor } from '@/utils/assignmentUtils';
import React from 'react'
import ProgressCircle from './ProgressCircle';
import TaskCard from '../task/TaskCard';
import { ArrowUpRightIcon, ChevronDownIcon, ChevronRightIcon, FilterIcon } from 'lucide-react';
import { formatDate } from '@/utils/utils';
import "./AssignmentListCard.css"

// export default function
interface AssignmentCardProps {
  assignment: Assignment;
  isExpanded: boolean;
  onToggleExpand: (assignmentId: string) => void;
  onViewDetails: (assignment: Assignment) => void;
  onStatusChange: (taskId: string) => void;
}


// AssignmentCard Component
export const AssignmentListCard = ({ 
  assignment, 
  isExpanded, 
  onToggleExpand, 
  onViewDetails,
  onStatusChange
}:AssignmentCardProps) => {
  const bgColor = getCardBgColor(assignment.tasks, assignment.deadline);
  const progress = calculateProgress(assignment.tasks);

  return (
    <div key={assignment.id}>
      <div
        className={`listItem ${isExpanded ? "expanded" : ""}`}
        style={{ backgroundColor: bgColor }}
        onClick={() => onToggleExpand(assignment.id)}
      >
        {/* list heading */}
        <div className="listItemIcon">
          {isExpanded ? (
            <ChevronDownIcon size={20} />
          ) : (
            <ChevronRightIcon size={20} />
          )}
        </div>
        <div className="listItemContent">
          <h3 className="listItemTitle">{assignment.title}</h3>
          <div className="listItemMeta">
            <span>
              Due date: {formatDate(assignment.deadline)} | Weighting:{" "}
              {assignment.weighting}%
            </span>
          </div>
        </div>
        <ProgressCircle percentage={progress} />
      </div>

      {isExpanded && (
        <div
          className="listItemDetails"
          style={{ backgroundColor: bgColor }}
        >
          <div className="listItemDescription">
            <p>{assignment.description}</p>
          </div>
          <div className="todoItems">
            <div className="todoItemHeader">
              <FilterIcon size={16} />
              <ArrowUpRightIcon size={16} />
            </div>
            {assignment.tasks && assignment.tasks.length > 0 ? (
              assignment.tasks.map((task) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onStatusChange={onStatusChange} // TODO: FIX ASSIGNMENT DETS
                />
              ))
            ) : (
              <div className="emptyTodoState">
                <p>No tasks added yet</p>
              </div>
            )}
          </div>
          <div className="detailsFooter">
            <button
              className="viewFullButton"
              onClick={() => onViewDetails(assignment)}
            >
              View Full Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};