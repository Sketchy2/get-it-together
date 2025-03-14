import GoogleSignIn from "@/components/auth/GoogleSignIn"
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
      <p>Sign in with Email</p>


        </div>
      </main>

    </>




  );
}