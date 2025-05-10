"use client"

import { SetStateAction, useState } from "react"
import ProfileHeader from "@/components/profile/ProfileHeader"
import ProfileStats from "@/components/profile/ProfileStats"
import ProfileDetails from "@/components/profile/ProfileDetails"
import EditProfileModal from "@/components/profile/EditProfileModal"
import "./profile.css"

export default function ProfilePage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    bio: "Computer Science student passionate about web development and AI. Currently working on my final year project.",
    joinedDate: "2023-09-01",
    avatar: "/placeholder.svg?height=200&width=200",
    department: "Computer Science",
    university: "University of Technology",
    studentId: "CS2023001",
    preferences: {
      emailNotifications: true,
      darkMode: true,
      remindersBefore: 2, // days
    },
  })

  const handleEditProfile = (updatedProfile: SetStateAction<{ name: string; email: string; bio: string; joinedDate: string; avatar: string; department: string; university: string; studentId: string; preferences: { emailNotifications: boolean; darkMode: boolean; remindersBefore: number } }>) => {
    setProfile({ ...profile, ...updatedProfile })
    setIsEditModalOpen(false)
  }

  return (
    <div className="profilePageContainer">
      <div className="profileContent">
        <ProfileHeader
          name={profile.name}
          avatar={profile.avatar}
          department={profile.department}
          university={profile.university}
          onEditClick={() => setIsEditModalOpen(true)}
        />

        <div className="profileBody">
          <div className="profileMainContent">
            <ProfileDetails
              bio={profile.bio}
              email={profile.email}
              joinedDate={profile.joinedDate}
              studentId={profile.studentId}
              department={profile.department}
              university={profile.university}
            />
          </div>

          <div className="profileSidebar">
            <ProfileStats />
          </div>
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleEditProfile}
        profile={profile}
      />
    </div>
  )
}
