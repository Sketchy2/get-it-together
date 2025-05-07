import { AssignmentLink, FileAttachment } from '@/types/assignment';
import { ChevronDown, ChevronRight, FileText, Link, Upload } from 'lucide-react';
import React from 'react'
import "./FilesLinksSection.css"

interface FilesLinksSectionProps{

    showFiles:boolean;
    setShowFiles:(toggle:boolean)=>void;
    files?: FileAttachment[]
    links?: AssignmentLink[]
  }

export default function FilesLinksSection({showFiles,setShowFiles,files=[],links=[]}:FilesLinksSectionProps) {
  return (
    <>
              <div className="sectionHeader">
            <h3 className="sectionTitle">Files</h3>
            <button className="toggleFilesButton" onClick={() => setShowFiles(!showFiles)}>
              {showFiles ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>
          </div>
    {showFiles && (
        <div className="filesContainer">
          {files.length > 0 ? ( //TODO: CREATE FILE CONTAINER 
            files.map((file, index) => (
              <div key={index} className="fileItem">
                <FileText size={16} />
                <span className="fileName">{file.name}</span>
              </div>
            ))
          ) : links && links.length > 0 ? (
            links.map((link: { url: string; title: string }, index: number) => (
              <div key={`link-${index}`} className="fileItem linkItem">
                <Link size={16} />
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="fileName linkName">
                  {link.title}
                </a>
              </div>
            ))
          ) : (
            <div className="emptyFilesState">No files or links attached</div>
          )}
          <div className="fileActions">
            <button className="fileActionButton">
              <Upload size={16} />
              <span>Upload File</span>
            </button>
            <button className="fileActionButton">
              <Link size={16} />
              <span>Add Link</span>
            </button>
          </div>
        </div>
      )}  
      </>)
}
