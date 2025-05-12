import { CheckCircle, Clock, AlertTriangle } from "lucide-react"
import "./ProfileStats.css"

interface ProfileStatsProps {
  stats: {
    completedAssignments: number
    activeAssignments: number
    completedTasks: number
    activeTasks: number
    upcomingDeadlines: number
  }
}

export default function ProfileStats({ stats }: ProfileStatsProps) {
  // Calculate overall completion percentage
  const totalTasks = stats.completedTasks + stats.activeTasks
  const completionPercentage = totalTasks > 0 ? Math.round((stats.completedTasks / totalTasks) * 100) : 0

  return (
    <div className="profileStatsContainer">
      <h2 className="statsTitle">Statistics</h2>

      <div className="statsSection">
        <h3 className="statsSectionTitle">Assignments</h3>
        <div className="statItems">
          <div className="statItem">
            <div className="statIcon completed">
              <CheckCircle size={18} />
            </div>
            <div className="statInfo">
              <div className="statValue">{stats.completedAssignments}</div>
              <div className="statLabel">Completed</div>
            </div>
          </div>

          <div className="statItem">
            <div className="statIcon active">
              <Clock size={18} />
            </div>
            <div className="statInfo">
              <div className="statValue">{stats.activeAssignments}</div>
              <div className="statLabel">Active</div>
            </div>
          </div>
        </div>
      </div>

      <div className="statsSection">
        <h3 className="statsSectionTitle">Tasks</h3>
        <div className="statItems">
          <div className="statItem">
            <div className="statIcon completed">
              <CheckCircle size={18} />
            </div>
            <div className="statInfo">
              <div className="statValue">{stats.completedTasks}</div>
              <div className="statLabel">Completed</div>
            </div>
          </div>

          <div className="statItem">
            <div className="statIcon active">
              <Clock size={18} />
            </div>
            <div className="statInfo">
              <div className="statValue">{stats.activeTasks}</div>
              <div className="statLabel">Active</div>
            </div>
          </div>
        </div>
      </div>

      <div className="statsSection">
        <h3 className="statsSectionTitle">Upcoming</h3>
        <div className="statItems">
          <div className="statItem">
            <div className="statIcon upcoming">
              <AlertTriangle size={18} />
            </div>
            <div className="statInfo">
              <div className="statValue">{stats.upcomingDeadlines}</div>
              <div className="statLabel">Deadlines this week</div>
            </div>
          </div>
        </div>
      </div>

      <div className="statsSection">
        <div className="progressSection">
          <div className="progressTitle">
            <span>Overall Completion</span>
            <span className="progressPercentage">{completionPercentage}%</span>
          </div>
          <div className="progressBar">
            <div className="progressFill" style={{ width: `${completionPercentage}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}
