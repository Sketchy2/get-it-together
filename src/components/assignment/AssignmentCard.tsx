import type React from "react";
import "./AssignmentCard.css";
import ProgressCircle from "./ProgressCircle";
import { formatDate } from "@/utils/utils";

interface AssignmentCardProps {
  title: string;
  deadline: string;
  weight: number;
  description: string;
  progress: number;
  daysRemaining: number;
  isLate: boolean;
  bgColor?: string;
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({
  title,
  deadline,
  weight,
  description,
  progress,
  daysRemaining,
  isLate,
  bgColor = "#DD992B",
}) => {

  const daysText = () => {
    if (progress == 100)
    { return "Completed!" }
    else {
      if (isLate) {
        return `${Math.abs(daysRemaining)} day${Math.abs(daysRemaining)>1?"s":""} overdue`
      } else {
        return `${Math.abs(daysRemaining)} day${Math.abs(daysRemaining)>1?"s":""} remaining`
      }
    }
  }
  
  console.log("AssignmentCard: ", {
    title,
    deadline,
    weight,
    description,
    progress,
    daysRemaining,
    isLate,
    bgColor,
  });
  
  return (
    <div className="card-wrapper">
      <div
        className="card"
        style={{
          backgroundColor: bgColor,
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
              Due: {formatDate(deadline)} | Weighed: {weight}%
            </span>
          </div>
          <p className="cardDescription">{description}</p>
          <div className="cardFooter">
            <div className="daysIndicator">
            </div>
          </div>
        </div>
        
        <div className="days-extension" style={{backgroundColor: bgColor}}>
          {daysText()}
        </div>
      </div>

    </div>
  );
};

export default AssignmentCard;
