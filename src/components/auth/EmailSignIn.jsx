import { signIn } from "@/auth"
 
export default function EmailSignIn() {
  return (
    <form
      action={async () => {
        "use server"
        await signIn()
      }}
    >
      <button type="submit">Sign In with email</button>
    </form>
  )
}