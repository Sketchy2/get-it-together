import { signIn } from "@/auth"
import "./EmailSignIn.css"


export default function EmailSignIn() {
  return (
    <form
      action={async (formData) => {
        "use server"
        await signIn("nodemailer", formData)      }}
    >
      <input className="rect" type="text" name="email" placeholder="Enter Email Address" />
      <button className="rect signInButton" type="submit">Signin with email</button>
    </form>
  )
}