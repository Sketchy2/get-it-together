// components/AssignmentCard.tsx
import type React from "react";
import "./AssignmentCard.css";
import ProgressCircle from "./ProgressCircle";
import { formatDate } from "@/utils/utils";

interface AssignmentCardProps {
  title: string;
  dueDate: string;
  weight: number;
  description: string;
  progress: number;
  daysRemaining: number;

  isLate: boolean;
  bgColor?: string;
  // width?: string;
  // height?: string;
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({
  title,
  dueDate,
  weight,
  description,
  progress,
  daysRemaining,
  isLate,
  bgColor = "#DD992B",
  // width = "280px",
  // height = "200px",
}) => {
  // calc

  return (
<div
  className="card"
  style={{
    backgroundColor: bgColor,
    // width,
    // height,
  }}
>
  <div className="cardContent">
<div className="cardHeader">
  <div className="cardTitleContainer">
    <h3 className="cardTitle">{title}</h3>
  </div>
  <div className="circleContainer">
    <ProgressCircle percentage={progress} />
  </div>
</div>

    <div className="cardMeta">
      <span>
        Due: {formatDate(dueDate)} | Weighed: {weight}%
      </span>
    </div>

    <p className="cardDescription">{description}</p>

    <div className="cardFooter">
      <div className="daysIndicator">
        <span className="daysText">
          {isLate ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days remaining`}
        </span>
      </div>
    </div>
  </div>
</div>  );
};

export default AssignmentCard;
