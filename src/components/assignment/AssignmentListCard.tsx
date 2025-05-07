import { Assignment } from "@/types/assignment";
import { calculateProgress, getCardBgColor } from "@/utils/assignmentUtils";
import React from "react";
import ProgressCircle from "../common/ProgressCircle";
import {
  Calendar,
  ChevronDownIcon,
  ChevronRightIcon,
  Clock,
  User,
  Weight,
} from "lucide-react";
import { formatDate } from "@/utils/utils";
import "./AssignmentListCard.css";

// export default function
interface AssignmentCardProps {
  assignment: Assignment;
  isExpanded: boolean;
  onToggleExpand: (assignmentId: string) => void;
  onViewDetails: (assignment: Assignment) => void;
}

// AssignmentCard Component
export const AssignmentListCard = ({
  assignment,
  isExpanded,
  onToggleExpand,
  onViewDetails,
}: AssignmentCardProps) => {
  const bgColor = getCardBgColor(assignment.tasks, assignment.deadline);
  const progress = calculateProgress(assignment.tasks);

  return (
    <div
      className={`listCardContatiner ${isExpanded ? "expanded" : ""}`}
      key={assignment.id}
    >
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
        <div className="listItemDetails" style={{ backgroundColor: bgColor }}>
          <div className="listItemDescription">
            {assignment.description && (
              <div className="taskDescription">
                {" "}
                <div className="taskDetailLabel">
                  <span>Description</span>
                </div>
                {assignment.description}
              </div>
            )}

            <div className="taskCardContent">
              <div className="taskDetailGrid">
                <div className="taskDetailItem">
                  <div className="taskDetailLabel">
                    <User size={14} />
                    <span>Assignees</span>
                  </div>
                  <div className="taskDetailValue">
                    {assignment.members ? (
                      // TODO: SHOW MULTIPLE USERS
                      <div className="assigneeInfo">
                        <div className="assigneeAvatar">
                          {assignment.members[0].name.charAt(0).toUpperCase()}
                        </div>
                        <span>{assignment.members[0].name}</span>
                      </div>
                    ) : (
                      <span className="unassigned">Unassigned</span>
                    )}
                  </div>
                </div>

                <div className="taskDetailItem">
                  <div className="taskDetailLabel">
                    <Calendar size={14} />
                    <span>Due Date</span>
                  </div>
                  <div className="taskDetailValue">
                    {assignment.deadline ? (
                      <div className="dueDateInfo">
                        <span>{formatDate(assignment.deadline)}</span>
                        {/* {daysInfo && (
                      <span className={`daysRemaining ${daysInfo.isOverdue ? "overdue" : ""}`}>{daysInfo.text}</span>
                    )} */}
                      </div>
                    ) : (
                      <span className="noDueDate">No due date</span>
                    )}
                  </div>
                </div>

                {/* TODO: Figure out the other items */}
                {/* <div className="taskDetailItem">
              <div className="taskDetailLabel">
                <Weight size={14} />
                <span>weighting</span>
              </div>
              <div className="taskDetailValue">
                <div className="weightInfo">
                  <div className="weightBar">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={`weightUnit ${i < (assignment.weighting || 1) ? "active" : ""}`}
                        style={{ opacity: i < (assignment.weighting || 1) ? 1 : 0.3 }}
                      ></div>
                    ))}
                  </div>
                  <span>
                    {assignment.weighting || 1}x weighting ({assignment.weighting ? assignment.weighting * 20 : 20}% of total)
                  </span>
                </div>
              </div>
            </div>

            <div className="taskDetailItem">
              <div className="taskDetailLabel">
                <Clock size={14} />
                <span>Created</span>
              </div>
              <div className="taskDetailValue">
                <span>{formatDate(assignment.createdAt)}</span>
              </div>
            </div> */}
              </div>
            </div>
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
