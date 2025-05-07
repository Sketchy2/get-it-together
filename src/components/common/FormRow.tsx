import React from 'react'

interface FormRowProps {
    children: React.ReactNode
  }

export default function FormRow({children}:FormRowProps) {
    return <div className="formRow">{children}</div>

}
