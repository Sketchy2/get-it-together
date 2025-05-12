"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { User, Mail, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import SignOut from "@/components/auth/SignOut"
import "./profile.css"

export default function ProfilePage() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState({
    name: "",
    email: "",
  })
  const [stats, setStats] = useState({
    completedAssignments: 0,
    activeAssignments: 0,
    completedTasks: 0,
    activeTasks: 0,
    upcomingDeadlines: 0,
  })

  // Fetch user profile data
  useEffect(() => {
    if (!session?.user?.id) return

    const fetchUserProfile = async () => {
  setIsLoading(true)
  try {
    if (!session?.user?.id) {
      throw new Error("User session or ID is not available")
    }

    // Set profile using session data
    setProfile({
      name: session.user.name || "",
      email: session.user.email || ""
    })

    // Now safe to call because session.user.id is guaranteed
    await fetchUserStats(session.user.id)
  } catch (err) {
    console.error("Error fetching user profile:", err)
    setError("Failed to load profile data. Please try again.")
  } finally {
    setIsLoading(false)
  }
}


    fetchUserProfile()
  }, [session])

  // Fetch user statistics
  const fetchUserStats = async (userId: string) => {
    try {
      // Fetch assignments for stats
      const assignmentsResponse = await fetch(`/api/user/assignment?userId=${userId}`)
      if (!assignmentsResponse.ok) {
        throw new Error("Failed to fetch assignments")
      }
      const assignments = await assignmentsResponse.json()

      // Fetch tasks for stats
      const tasksResponse = await fetch(`/api/tasks?userId=${userId}`)
      if (!tasksResponse.ok) {
        throw new Error("Failed to fetch tasks")
      }
      const tasks = await tasksResponse.json()

      console.log("Fetched tasks:", tasks) // Debug log

      // Calculate statistics
      const completedAssignments = assignments.filter((a: any) => {
        // An assignment is considered complete if all its tasks are completed
        if (!a.tasks || a.tasks.length === 0) return false
        return a.tasks.every((t: any) => t.status === "Completed")
      }).length

      const activeAssignments = assignments.length - completedAssignments

      // Make sure we're counting actual tasks from the API response
      const completedTasks = Array.isArray(tasks) ? tasks.filter((t: any) => t.status === "Completed").length : 0
      const activeTasks = Array.isArray(tasks) ? tasks.length - completedTasks : 0

      // Calculate upcoming deadlines (assignments due in the next 7 days)
      const now = new Date()
      const oneWeekLater = new Date(now)
      oneWeekLater.setDate(oneWeekLater.getDate() + 7)

      const upcomingDeadlines = assignments.filter((a: any) => {
        const deadline = new Date(a.deadline)
        return deadline >= now && deadline <= oneWeekLater
      }).length

      setStats({
        completedAssignments,
        activeAssignments,
        completedTasks,
        activeTasks,
        upcomingDeadlines,
      })
    } catch (err) {
      console.error("Error fetching user stats:", err)
      throw err
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="profile-loading">
        <div className="loadingSpinner"></div>
        <p>Loading profile...</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="profile-error">
        <div className="errorIcon">!</div>
        <h2>Error Loading Profile</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    )
  }

  return (
    <div className="profile-container">
      <h1 className="profile-title">Profile</h1>

      <div className="profile-grid">
        {/* User Information Card */}
        <div className="profile-card user-info-card">
          <div className="card-header">
            <h2>User Information</h2>
          </div>
          <div className="card-content">
            <div className="user-info-item">
              <User size={20} />
              <div className="user-info-details">
                <span className="info-label">Name</span>
                <span className="info-value">{profile.name}</span>
              </div>
            </div>
            <div className="user-info-item">
              <Mail size={20} />
              <div className="user-info-details">
                <span className="info-label">Email</span>
                <span className="info-value">{profile.email}</span>
              </div>
            </div>
          </div>
          <div className="card-actions">
            <div className="signout-wrapper">
              <SignOut />
            </div>
          </div>
        </div>

        {/* Statistics Card */}
        <div className="profile-card stats-card">
          <div className="card-header">
            <h2>Statistics</h2>
          </div>
          <div className="card-content">
            <div className="stats-section">
              <h3>Assignments</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-icon completed">
                    <CheckCircle size={18} />
                  </div>
                  <div className="stat-details">
                    <span className="stat-value">{stats.completedAssignments}</span>
                    <span className="stat-label">Completed</span>
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon active">
                    <Clock size={18} />
                  </div>
                  <div className="stat-details">
                    <span className="stat-value">{stats.activeAssignments}</span>
                    <span className="stat-label">Active</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="stats-section">
              <h3>Tasks</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-icon completed">
                    <CheckCircle size={18} />
                  </div>
                  <div className="stat-details">
                    <span className="stat-value">{stats.completedTasks}</span>
                    <span className="stat-label">Completed</span>
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon active">
                    <Clock size={18} />
                  </div>
                  <div className="stat-details">
                    <span className="stat-value">{stats.activeTasks}</span>
                    <span className="stat-label">Active</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="stats-section">
              <h3>Upcoming</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-icon upcoming">
                    <AlertTriangle size={18} />
                  </div>
                  <div className="stat-details">
                    <span className="stat-value">{stats.upcomingDeadlines}</span>
                    <span className="stat-label">Deadlines this week</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
