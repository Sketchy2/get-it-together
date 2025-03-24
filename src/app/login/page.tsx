import GoogleSignIn from "@/components/auth/GoogleSignIn"
import EmailSignIn from "@/components/auth/EmailSignIn"
import "./login.css"

export default function Login() {
  return (
    <>
      <span></span>
      <main className="title">
        <div>
        <h1>Get it Together</h1>
        <p>Task Management System for Students</p>
        
      <GoogleSignIn />
      <p>or</p>
      <EmailSignIn />


        </div>
      </main>

    </>




  );
}
