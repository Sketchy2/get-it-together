// components/AssignmentCard.tsx
import type React from "react"
import "./AssignmentCard.css"
import ProgressCircle from "./ProgressCircle"

interface AssignmentCardProps {
  title: string
  date: string
  dueDate: string
  weight: number
  description: string
  progress: number
  daysRemaining: number
  isLate: boolean
  bgColor?: string
  width?: string
  height?: string
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
  bgColor = "#DD992B",
  width = "280px",
  height = "150px",
}) => {

  // calc





  return (
    <div
      className="card"
      style={{
        backgroundColor: bgColor,
        width,
        height,
      }}
    >
      <div className="cardContent">
        <h3 className="cardTitle">{title}</h3>

        <div className="cardMeta">
          <span>
            {date} + day due | Weighed {weight}%
          </span>
        </div>

        <p className="cardDescription">{description}</p>
        <div className="cardFooter">
        <ProgressCircle percentage={progress} />

          {/* <div className="progressCircleContainer">
            <div className="progress-circle">
              <svg viewBox="0 0 36 36">
                <path
                  className="progress-circle-bg"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="progress-circle-fill"
                  strokeDasharray={`${progress}, 100`}
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <text x="18" y="20.35" className="progress-text">
                  {progress}%
                </text>
              </svg>
            </div>
          </div> */}

          <div className="daysIndicator">
            <span className="daysText">
              {isLate ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days remaining`}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssignmentCard
