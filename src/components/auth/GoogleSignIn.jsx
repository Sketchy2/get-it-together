import { signIn } from "@/auth"
import styles from './GoogleSignIn.module.css'
 
export default function SignIn() {
  return (
    <form
      action={async () => {
        "use server"
        await signIn("google",{redirectTo:"/home"})
      }}
    >
      <button className={styles.customBtn}
      type="submit">Sign in with Google</button>
    </form>
  )
} 