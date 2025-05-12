"use client"

import { SignOutAction } from "./SignOutAction"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import "./SignOut.css"

export default function SignOut() {
  const router = useRouter()

  const handleSignOut = async (e) => {
    e.preventDefault()
    await SignOutAction()
    router.push("/")
  }

  return (
    <button 
      className="signOutButton" 
      onClick={handleSignOut}
    >
      <LogOut size={16} /> Sign Out
    </button>
  )
}
