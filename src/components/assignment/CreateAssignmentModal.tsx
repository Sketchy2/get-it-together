"use client"

import type React from "react"

import { useState } from "react"
import { X, Upload, Plus, User, Calendar, Percent, FileText, Link } from "lucide-react"
import "./CreateAssignmentModal.css"

interface CreateAssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (assignment: any) => void
}

const CreateAssignmentModal: React.FC<CreateAssignmentModalProps> = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [deadline, setDueDate] = useState("")
  const [weight, setWeight] = useState(100) // Default to 100% for the total assignment
  const [members, setMembers] = useState<string[]>([])
  const [newMember, setNewMember] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [links, setLinks] = useState<{ url: string; title: string }[]>([])
  const [newLink, setNewLink] = useState({ url: "", title: "" })
  const [showLinkForm, setShowLinkForm] = useState(false)

  if (!isOpen) return null

  const handleAddLink = () => {
    if (newLink.url && newLink.title) {
      setLinks([...links, newLink])
      setNewLink({ url: "", title: "" })
      setShowLinkForm(false)
    }
  }

  const handleRemoveLink = (index: number) => {
    const updatedLinks = [...links]
    updatedLinks.splice(index, 1)
    setLinks(updatedLinks)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Calculate days remaining
    const today = new Date()
    const due = new Date(deadline)
    const daysRemaining = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    const newAssignment = {
      id: `assignment-${Date.now()}`,
      title,
      date: today.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      deadline: due.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      weight,
      description,
      progress: 0,
      daysRemaining,
      isLate: daysRemaining < 0,
      members,
      files: files.map((file) => file.name),
      links: links,
      todos: [],
    }

    onSave(newAssignment)
    resetForm()
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setDueDate("")
    setWeight(100)
    setMembers([])
    setNewMember("")
    setFiles([])
    setLinks([])
    setNewLink({ url: "", title: "" })
    setShowLinkForm(false)
  }

  const handleAddMember = () => {
    if (newMember && !members.includes(newMember)) {
      setMembers([...members, newMember])
      setNewMember("")
    }
  }

  const handleRemoveMember = (email: string) => {
    setMembers(members.filter((member) => member !== email))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles([...files, ...newFiles])
    }
  }

  const handleRemoveFile = (fileName: string) => {
    setFiles(files.filter((file) => file.name !== fileName))
  }

  return (
    <div className="createModalOverlay">
      <div className="createModalContent">
        <div className="createModalHeader">
          <h2>Create New Assignment</h2>
          <button className="closeButton" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="createForm">
          <div className="formGroup">
            <label htmlFor="title">Assignment Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter assignment title"
              required
            />
          </div>

          <div className="formGroup">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter assignment description"
              rows={4}
            />
          </div>

          <div className="formRow">
            <div className="formGroup shared">
              <label htmlFor="deadline" className="inputWithIcon">
                <Calendar size={16} />
                <span>Due Date</span>
              </label>
              <input type="date" id="deadline" value={deadline} onChange={(e) => setDueDate(e.target.value)} required />
            </div>

            <div className="formGroup shared">
              <label htmlFor="weight" className="inputWithIcon">
                <Percent size={16} />
                <span>Total Weight (%)</span>
              </label>
              <input
                type="number"
                id="weight"
                value={weight || ""}
                onChange={(e) => setWeight(Number(e.target.value))}
                min="1"
                max="100"
                required
              />
              <div className="weightDescription">
                This is the total weight of the assignment. Tasks will be created with weights that add up to this
                total.
              </div>
            </div>
          </div>

          <div className="formGroup">
            <label htmlFor="members" className="inputWithIcon">
              <User size={16} />
              <span>Add Members</span>
            </label>
            <div className="memberInputContainer">
              <input
                type="email"
                id="members"
                value={newMember}
                onChange={(e) => setNewMember(e.target.value)}
                placeholder="Enter email address"
              />
              <button type="button" className="addButton" onClick={handleAddMember} disabled={!newMember}>
                <Plus size={16} />
              </button>
            </div>

            {members.length > 0 && (
              <div className="membersList">
                {members.map((member, index) => (
                  <div key={index} className="memberChip">
                    <span>{member}</span>
                    <button type="button" className="removeButton" onClick={() => handleRemoveMember(member)}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="formGroup">
            <label htmlFor="files" className="inputWithIcon">
              <Upload size={16} />
              <span>Attach Files & Links</span>
            </label>
            <div className="fileUploadContainer">
              <input type="file" id="files" onChange={handleFileChange} multiple className="fileInput" />
              <label htmlFor="files" className="fileUploadButton">
                <Upload size={16} />
                <span>Choose Files</span>
              </label>
            </div>

            {files.length > 0 && (
              <div className="filesList">
                {files.map((file, index) => (
                  <div key={index} className="fileChip">
                    <FileText size={14} />
                    <span>{file.name}</span>
                    <button type="button" className="removeButton" onClick={() => handleRemoveFile(file.name)}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="linkSection">
              <button
                type="button"
                className="addLinkButton"
                onClick={() => setShowLinkForm(true)}
                style={{ display: showLinkForm ? "none" : "flex" }}
              >
                <Link size={16} />
                <span>Add Link</span>
              </button>

              {showLinkForm && (
                <div className="linkForm">
                  <div className="linkInputs">
                    <input
                      type="text"
                      placeholder="Link Title"
                      value={newLink.title}
                      onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                    />
                    <input
                      type="url"
                      placeholder="URL (https://...)"
                      value={newLink.url}
                      onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                    />
                  </div>
                  <div className="linkFormActions">
                    <button
                      type="button"
                      className="cancelLinkButton"
                      onClick={() => {
                        setShowLinkForm(false)
                        setNewLink({ url: "", title: "" })
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="saveLinkButton"
                      onClick={handleAddLink}
                      disabled={!newLink.url || !newLink.title}
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}

              {links.length > 0 && (
                <div className="linksList">
                  <h4>Added Links</h4>
                  {links.map((link, index) => (
                    <div key={index} className="linkChip">
                      <Link size={14} />
                      <span title={link.url}>{link.title}</span>
                      <button type="button" className="removeButton" onClick={() => handleRemoveLink(index)}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="formActions">
            <button type="button" className="cancelButton" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="saveButton">
              Create Assignment
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateAssignmentModal
