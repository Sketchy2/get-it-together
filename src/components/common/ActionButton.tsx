import React, { ReactNode } from 'react'
import "./ActionButton.css"
interface ActionButtonProps{
    icon:ReactNode
    tooltip?:string
    onclick:()=>void
    zIdx?:number
}

export default function ActionButton({icon,tooltip,onclick,zIdx}:ActionButtonProps) {
  
  const buttonLayer = zIdx?{zIndex:zIdx}:{zIndex:10}
  
  return (
    <button
    className="floatingActionButton"
    onClick={onclick}
    title ={tooltip}
    style={buttonLayer}
  >
    {icon}
  </button>
)
}
