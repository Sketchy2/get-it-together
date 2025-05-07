import React from 'react'

interface FormItemProps {
    label?: string
    icon?: React.ReactNode
    htmlFor?: string
    children: React.ReactNode
  }
  

export default function FormItem({ label, icon, htmlFor, children }:FormItemProps) {
  return (
    <div className="formGroup">
      {label && (
        <label htmlFor={htmlFor} className={icon ? "inputWithIcon" : undefined}>
          {icon && icon}
          <span>{label}</span>
        </label>
      )}
      {children}
    </div>
  )
}


