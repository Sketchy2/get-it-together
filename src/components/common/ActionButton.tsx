import React, { ReactNode } from 'react'
import "./ActionButton.css"
interface ActionButtonProps{
    icon:ReactNode
    tooltip?:string
    onclick:()=>void
}

export default function ActionButton({icon,tooltip,onclick}:ActionButtonProps) {
  return (
    <button
    className="floatingActionButton"
    onClick={onclick}
    title ={tooltip}
  >
    {icon}
  </button>
)
}
