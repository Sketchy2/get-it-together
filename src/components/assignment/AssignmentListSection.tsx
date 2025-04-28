import React from 'react'

interface AssignmentSectionProps {
  title: string
  color: string
  children: React.ReactNode
}

// AssignmentCard Component

export const AssignmentListSection = ({ title, color, children }:AssignmentSectionProps) =>  {
  return (
    <div className="listSection">
    <div className="listSectionHeader" style={{ backgroundColor: color }}>
      <h2 className="listSectionTitle">{title}</h2>
      </div>
      <div className="listItems">

        {children}
      </div>
      </div>
  );
};