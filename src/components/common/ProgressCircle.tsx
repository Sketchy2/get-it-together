import React from 'react'
import "./ProgressCircle.css"

interface ProgressCircle {
    percentage: number;

  }
  

export default function ProgressCircle({percentage}:ProgressCircle) {
  return (
    <div className="progressCircleContainer">
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
          strokeDasharray={`${percentage}, 100`}
          d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        <text x="18" y="20.35" className="progress-text">
          {percentage}%
        </text>
      </svg>
    </div>
  </div>
  )
}
