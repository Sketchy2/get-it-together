import { SignOutAction } from "@/components/auth/SignOutAction"
import { LogOut } from "lucide-react";
import Router from "next/router";
import "./SignOut.css"
 
export default function SignOut() {
  return (
    <form
      action={async () => {
        Router.push("./");
              await SignOutAction();
          }}
    >
      <button className="signOutButton" type="submit"><LogOut size={16} />Sign Out</button>
    </form>
  )
} 