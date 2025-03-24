import React from 'react'
import Link from 'next/link'
import "./NavBar.css"


export default function NavBar() {
  return (
    <nav >NavBar
    <ul>    
    <li><Link href="/task">Tasks</Link></li>
    <li><Link href="/assignment">Assignments</Link></li>
    <li><Link href="/schedule">Scheduling</Link></li>
    <li><Link href="/setting">Settings</Link></li>
    </ul>

    </nav>
  )
}
