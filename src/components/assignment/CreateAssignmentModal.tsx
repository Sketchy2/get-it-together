"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { X, Upload, Plus, User, Calendar, Percent, FileText, Link } from "lucide-react"
import "./CreateAssignmentModal.css"
import { Assignment } from "@/types/assignment"
import FormItem from "../common/FormItem"
import Form from "../common/Form"
import FormRow from "../common/FormRow"


// TODO: Have so can accept props with assignment details to modify
interface CreateAssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (assignment: any) => void // basically accept assignment but allow for usage of email
  assignment: Assignment | null
}

const CreateAssignmentModal: React.FC<CreateAssignmentModalProps> = ({ isOpen, onClose, onSave ,assignment}) => {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [weighting, setWeight] = useState(100) // Default to 100% for the total assignment 
  const [members, setMembers] = useState<string[]>([]) // have so accepts 
  const [newMember, setNewMember] = useState("") //TODO: figure out how members will be handled in forms
  const [files, setFiles] = useState<File[]>([])
  const [showLinkForm, setShowLinkForm] = useState(false)
  const [rawDeadline, setRawDeadline] = useState<string>("");


  // prefill information if possible
    useEffect(() => {
      if (isOpen && assignment) {
        setTitle(assignment.title)
        setDescription(assignment.description||"")
        setRawDeadline( assignment.deadline.slice(0,10) )
        setWeight(assignment.weighting||100)
        // setMembers([assignment.members?.[0]?.id]||[]) //TODO: CHANGE SO ACCEPTS USERS
        // setFiles(assignment.files||[]) // TODO: Adjust file type to match db reqs
      }
    }, [isOpen, assignment])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const isoDeadline = rawDeadline
    ? new Date(rawDeadline + "T00:00:00.000Z").toISOString()
    : null

    // Calculate days remaining
    const today = new Date()
    const isEdit = Boolean(assignment);
    const newAssignment = {
      id:     isEdit ? assignment!.id : `assignment-${Date.now()}`,
      title,
      createdAt: today.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      deadline: isoDeadline,
      weighting,
      description,
      members, // TODO: ENSURE create assignment API can accept emails
              // TODO: ensure that
      todos: [],
    }
    console.log("New Assignment:", newAssignment)
    onSave(newAssignment)
    resetForm()
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setRawDeadline("")
    setWeight(100)
    setMembers([])
    setNewMember("")
    setFiles([])
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

  return (
    <Form
      isOpen={isOpen}
      onClose={onClose}
      onSave={handleSubmit}
      formTitle={assignment?"Edit Assignment":"Create New Assignment"}  
      formSubmitLabel={assignment?"Edit Assignment":"Create Assignment"}
  
      disabledCondition={false}
    >
      <FormItem label="Assignment Title" htmlFor="title">
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter assignment title"
          required
        />
      </FormItem>

      <FormItem label="Description" htmlFor="description">
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter assignment description"
          rows={4}
        />
      </FormItem>

      <FormRow>
        <FormItem icon={<Calendar size={16} />} label={"Due Date"}  htmlFor="deadline">
        <input
          type="date"
          id="deadline"
          value={rawDeadline}
          onChange={e => setRawDeadline(e.target.value)}
          required
        />
        </FormItem>

        <FormItem icon={<Percent size={16} />} label={"Total weighting (%)"} htmlFor="weighting">
          <input
            type="number"
            id="weighting"
            value={weighting || ""}
            onChange={(e) => setWeight(Number(e.target.value))}
            min="1"
            max="100"
            required
          />
          <div className="weightDescription">
            This is the total weighting of the assignment. Tasks will be created with weights that add up to this total.
          </div>
        </FormItem>
      </FormRow>

      <FormItem icon={<User size={16} />} label={"Add Members"} htmlFor="members">
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
      </FormItem>

      {/* <FormItem icon={<Upload size={16} />} label={"Attach Files & Links"} htmlFor="files">
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
            <div className="filesList">
              {links.map((link, index) => (
                              <div key={index} className="fileChip">
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
      </FormItem> */}
    </Form>

  )
}

export default CreateAssignmentModal
