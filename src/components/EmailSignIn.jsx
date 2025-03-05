import { signIn } from "../auth.ts"
 
export function SignIn() {
  return (
    <form
      action={async (formData) => {
        "use server"
        await signIn("mailgun", formData)
      }}
    >
      <input type="text" name="email" placeholder="Email" />
      <button type="submit">Signin with Mailgun</button>
    </form>
  )
}