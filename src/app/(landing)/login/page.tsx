import GoogleSignIn from "@/components/GoogleSignIn"

export default function Login() {
  return (
    <div >
     <h1>Get it Together</h1> 
     <p>Task Management System for Students</p> 

      <GoogleSignIn />
      <p>or</p> 
      <EmailSignIn />


    </div>
  );
}
