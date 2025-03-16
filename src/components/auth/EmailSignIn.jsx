import { signIn } from "@/auth"
 
export default function EmailSignIn() {
  return (
    <form
      action={async (formData) => {
        "use server"
        await signIn("nodemailer", formData)      }}
    >
      <input type="text" name="email" placeholder="Email" />
      <button type="submit">Signin with email</button>
    </form>
  )
}