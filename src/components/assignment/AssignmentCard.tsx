// components/AssignmentCard.tsx
import React from 'react';
import './AssignmentCard.css';

interface AssignmentCardProps {
  title: string;
  date: string;
  dueDate: string;
  weight: number;
  description: string;
  progress: number;
  daysRemaining: number;
  isLate: boolean;
  bgColor?: string;
  width?: string;
  height?: string;
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({
  title,
  date,
  dueDate,
  weight,
  description,
  progress,
  daysRemaining,
  isLate,
  bgColor = '#DD992B',
  width = '280px',
  height = '150px'
}) => {
  return (
    <div 
      className="card" 
      style={{ 
        backgroundColor: bgColor,
        width,
        height
      }}
    >
      <div className="cardContent">
        <h3 className="cardTitle">{title}</h3>
        
        <div className="cardMeta">
          <span>{date} + day due | Weighed {weight}%</span>
        </div>
        
        <p className="cardDescription">{description}</p>
        
        <div className="cardFooter">
          <div className="progressContainer">
            <div 
              className="progressBar" 
              style={{ width: `${progress}%` }}
            ></div>
            <span className="progressText">{progress}%</span>
          </div>
          
          <div className="daysIndicator">
            <span className="daysText">
              {isLate ? 
                `${Math.abs(daysRemaining)} days overdue` : 
                `${daysRemaining} days remaining`
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentCard;