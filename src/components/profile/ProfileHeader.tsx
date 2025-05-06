"use client"

import { Edit, Camera } from "lucide-react"
import Image from "next/image"
import "./ProfileHeader.css"

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
            <button className="changeAvatarButton">
              <Camera size={16} />
            </button>
          </div>
        </div>

        <div className="profileInfo">
          <h1 className="profileName">{name}</h1>
          <div className="profileMeta">
            <span className="profileDepartment">{department}</span>
            <span className="profileDivider">•</span>
            <span className="profileUniversity">{university}</span>
          </div>
        </div>

        <button className="editProfileButton" onClick={onEditClick}>
          <Edit size={16} />
          <span>Edit Profile</span>
        </button>
      </div>

      <div className="profileHeaderBackground"></div>
    </div>
  )
}
