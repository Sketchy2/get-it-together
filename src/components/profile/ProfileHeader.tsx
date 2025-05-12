"use client"

import { Edit } from "lucide-react"
import Image from "next/image"
import "./ProfileHeader.css"
import SignOut from "../auth/SignOut"

interface ProfileHeaderProps {
  name: string
  avatar: string
  department: string
  university: string
  onEditClick: () => void
}

export default function ProfileHeader({ name, avatar, department, university, onEditClick }: ProfileHeaderProps) {
  return (
    <div className="profileHeader">
      <div className="profileHeaderContent">
        <div className="avatarContainer">
          <div className="avatarWrapper">
            <Image src={avatar || "/placeholder.svg"} alt={name} width={120} height={120} className="avatar" />
          </div>
        </div>

        <div className="profileInfo">
          <h1 className="profileName">{name}</h1>
          {(department || university) && (
            <div className="profileMeta">
              {department && <span className="profileDepartment">{department}</span>}
              {department && university && <span className="profileDivider">•</span>}
              {university && <span className="profileUniversity">{university}</span>}
            </div>
          )}
        </div>

        <button className="editProfileButton" onClick={onEditClick}>
          <Edit size={16} />
          <span>Edit Profile</span>
        </button>
        <SignOut />
      </div>

      <div className="profileHeaderBackground"></div>
    </div>
  )
}
