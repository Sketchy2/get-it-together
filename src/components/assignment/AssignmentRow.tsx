import type React from "react"
import "./AssignmentRow.css"
import { ChevronRightIcon } from "lucide-react"

interface AssignmentRowProps {
  title: string
  color: string
  children: React.ReactNode
}

const AssignmentRow: React.FC<AssignmentRowProps> = ({ title, color, children }) => {
  return (
    <div className="rowContainer">
      <div className="rowHeader" style={{ backgroundColor: color }}>
        <div className="verticalTitleContainer">
          {/* <ChevronRightIcon size={20} className="rotatedIcon" /> */}
          <h2 className="verticalTitle">{title}</h2>
        </div>
      </div>
      <div className="rowContent">{children}</div>
    </div>
  )
}

export default AssignmentRow
