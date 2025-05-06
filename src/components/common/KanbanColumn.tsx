// components/KanbanColumn.tsx
import {  Droppable, Draggable } from "@hello-pangea/dnd";
import React from "react";
import { Task } from "@/types/task";

interface KanbanColumnProps {
  droppableId: string;
  title: string;
  items: any[];
  renderItem: (task: any, index: number) => React.ReactNode;
  headerContent?: React.ReactNode;
  footerContent?: React.ReactNode;
  className?: string;
}

export default function KanbanColumn ({
  droppableId,
  title,
  items,
  renderItem,
  headerContent,
  footerContent,
  className = "",
}:KanbanColumnProps) {
  return (
    <div className={`kanbanColumn ${className}`}>
      <div className="columnHeader">
        <div className="columnHeaderTitle">
          {headerContent}
          <h3>{title}</h3>
        </div>
        <span className="taskCount">{items.length}</span>
      </div>

      {footerContent}

      <Droppable droppableId={droppableId}>
        {(provided) => (
          <div
            className="columnContent"
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {items.map((task, index) => (
              <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    {renderItem(task, index)}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};
