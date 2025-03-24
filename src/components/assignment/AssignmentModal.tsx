import React from 'react';
import './AssignmentModal.css';
import AssignmentDetails from './AssignmentDetails';

interface AssignmentModalProps {
  isOpen: boolean;
  assignment: any;
  onClose: () => void;
  onTodoToggle: (id: string) => void;
  onTodoExpand: (id: string) => void;
  onAddTodo: () => void;
}

const AssignmentModal: React.FC<AssignmentModalProps> = ({
  isOpen,
  assignment,
  onClose,
  onTodoToggle,
  onTodoExpand,
  onAddTodo
}) => {
  if (!isOpen || !assignment) return null;

  return (
    <div className="modalOverlay">
      <div className="modalContent">
        <AssignmentDetails
          id={assignment.id}
          title={assignment.title}
          date={assignment.date}
          dueDate={assignment.dueDate}
          weight={assignment.weight}
          description={assignment.description}
          progress={assignment.progress}
          daysRemaining={assignment.daysRemaining}
          isLate={assignment.isLate}
          bgColor={assignment.bgColor}
          todos={assignment.todos || []}
          onClose={onClose}
          onTodoToggle={onTodoToggle}
          onTodoExpand={onTodoExpand}
          onAddTodo={onAddTodo}
        />
      </div>
    </div>
  );
};

export default AssignmentModal;
