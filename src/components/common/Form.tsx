import { useOnClickOutside } from "@/utils/utils";
import { X } from "lucide-react";
import React, { useRef } from "react";
import "./Form.css"

interface FormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
  formTitle: string;
  children: React.ReactNode;
  disabledCondition:boolean
}

// Base form component to base other componenets on
export default function Form({
  isOpen,
  onClose,
  onSave,
  formTitle,
  children,
  disabledCondition,
  ...props
}: FormProps) {
  //manage closing via clicking outside of form
  const formRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(formRef, onClose);
  if (!isOpen) return null

  return (
    <div className="formModalOverlay">

      <div ref={formRef} className="formModalContent">
        <div className="formModalHeader">
          <h3>{formTitle}</h3>
          <button className="closeButton" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={onSave} {...props} className="form">
          {children}

          <div className="formActions">
            <button type="button" className="cancelButton" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="saveButton" disabled={disabledCondition}>
              Create Task
            </button>
          </div>
        </form>
      </div>
      </div>
  );
}
