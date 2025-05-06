"use client"

import { useState } from "react"
import { X, User, Mail, BookOpen, School, BadgeIcon as IdCard, Save } from "lucide-react"
import "./EditProfileModal.css"

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (updatedProfile: any) => void
  profile: {
    name: string
    email: string
    bio: string
    department: string
    university: string
    studentId: string
    preferences: {
      emailNotifications: boolean
      darkMode: boolean
      remindersBefore: number
    }
  }
}

export default function EditProfileModal({ isOpen, onClose, onSave, profile }: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    name: profile.name,
    email: profile.email,
    bio: profile.bio,
    department: profile.department,
    university: profile.university,
    studentId: profile.studentId,
    preferences: {
      emailNotifications: profile.preferences.emailNotifications,
      darkMode: profile.preferences.darkMode,
      remindersBefore: profile.preferences.remindersBefore,
    },
  })

  if (!isOpen) return null

  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePreferenceChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    const val = type === "checkbox" ? checked : value;
  
    setFormData((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [name]: type === "number" ? parseInt(val as string) : val,
      },
    }));
  };
  

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="modalOverlay">
      <div className="editProfileModal">
        <div className="modalHeader">
          <h2>Edit Profile</h2>
          <button className="closeButton" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="editProfileForm">
          <div className="formSection">
            <h3 className="formSectionTitle">Personal Information</h3>

            <div className="formGroup">
              <label htmlFor="name" className="formLabel">
                <User size={16} />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="formInput"
                required
              />
            </div>

            <div className="formGroup">
              <label htmlFor="email" className="formLabel">
                <Mail size={16} />
                <span>Email</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="formInput"
                required
              />
            </div>

            <div className="formGroup">
              <label htmlFor="bio" className="formLabel">
                <span>Bio</span>
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="formTextarea"
                rows={4}
              />
            </div>
          </div>

          <div className="formSection">
            <h3 className="formSectionTitle">Academic Information</h3>

            <div className="formGroup">
              <label htmlFor="university" className="formLabel">
                <School size={16} />
                <span>University</span>
              </label>
              <input
                type="text"
                id="university"
                name="university"
                value={formData.university}
                onChange={handleChange}
                className="formInput"
              />
            </div>

            <div className="formGroup">
              <label htmlFor="department" className="formLabel">
                <BookOpen size={16} />
                <span>Department</span>
              </label>
              <input
                type="text"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="formInput"
              />
            </div>

            <div className="formGroup">
              <label htmlFor="studentId" className="formLabel">
                <IdCard size={16} />
                <span>Student ID</span>
              </label>
              <input
                type="text"
                id="studentId"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                className="formInput"
              />
            </div>
          </div>

          <div className="formSection">
            <h3 className="formSectionTitle">Preferences</h3>

            <div className="formGroup checkboxGroup">
              <label className="checkboxLabel">
                <input
                  type="checkbox"
                  name="emailNotifications"
                  checked={formData.preferences.emailNotifications}
                  onChange={handlePreferenceChange}
                  className="checkboxInput"
                />
                <span>Email Notifications</span>
              </label>
            </div>

            <div className="formGroup checkboxGroup">
              <label className="checkboxLabel">
                <input
                  type="checkbox"
                  name="darkMode"
                  checked={formData.preferences.darkMode}
                  onChange={handlePreferenceChange}
                  className="checkboxInput"
                />
                <span>Dark Mode</span>
              </label>
            </div>

            <div className="formGroup">
              <label htmlFor="remindersBefore" className="formLabel">
                <span>Deadline Reminders (days before)</span>
              </label>
              <select
                id="remindersBefore"
                name="remindersBefore"
                value={formData.preferences.remindersBefore}
                onChange={handlePreferenceChange}
                className="formSelect"
              >
                <option value="1">1 day</option>
                <option value="2">2 days</option>
                <option value="3">3 days</option>
                <option value="5">5 days</option>
                <option value="7">1 week</option>
              </select>
            </div>
          </div>

          <div className="formActions">
            <button type="button" className="cancelButton" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="saveButton">
              <Save size={16} />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
