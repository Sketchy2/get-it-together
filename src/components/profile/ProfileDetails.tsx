import { Mail, Calendar, BookOpen, School, BadgeIcon as IdCard } from "lucide-react"
import { formatDate } from "@/utils/utils"
import "./ProfileDetails.css"

interface ProfileDetailsProps {
  bio: string
  email: string
  joinedDate: string
  studentId: string
  department: string
  university: string
}

export default function ProfileDetails({
  bio,
  email,
  joinedDate,
  studentId,
  department,
  university,
}: ProfileDetailsProps) {
  return (
    <div className="profileDetailsContainer">
      <div className="profileSection">
        <h2 className="sectionTitle">About</h2>
        <p className="bioText">{bio}</p>
      </div>

      <div className="profileSection">
        <h2 className="sectionTitle">Contact Information</h2>
        <div className="infoGrid">
          <div className="infoItem">
            <div className="infoLabel">
              <Mail size={16} />
              <span>Email</span>
            </div>
            <div className="infoValue">{email}</div>
          </div>
        </div>
      </div>

      <div className="profileSection">
        <h2 className="sectionTitle">Academic Information</h2>
        <div className="infoGrid">
          <div className="infoItem">
            <div className="infoLabel">
              <School size={16} />
              <span>University</span>
            </div>
            <div className="infoValue">{university}</div>
          </div>

          <div className="infoItem">
            <div className="infoLabel">
              <BookOpen size={16} />
              <span>Department</span>
            </div>
            <div className="infoValue">{department}</div>
          </div>

          <div className="infoItem">
            <div className="infoLabel">
              <IdCard size={16} />
              <span>Student ID</span>
            </div>
            <div className="infoValue">{studentId}</div>
          </div>

          <div className="infoItem">
            <div className="infoLabel">
              <Calendar size={16} />
              <span>Joined</span>
            </div>
            <div className="infoValue">{formatDate(joinedDate)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
