import { signIn } from "@/auth";
import "./GoogleSignIn.css";
import GoogleIcon from "./google_icon.svg";
import Image from "next/image";

export default function SignIn() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("google", { redirectTo: "/home" });
      }}
    >
      <button className="gsi-material-button">
        <div className="gsi-material-button-state"></div>
        <div className="gsi-material-button-content-wrapper">
          <Image
            className="gsi-material-button-icon"
            alt="Google Icon"
            src={GoogleIcon}
          />
          <span className="gsi-material-button-contents">
            Sign in with Google
          </span>
          <span style={{ display: "none" }}>Sign in with Google</span>
        </div>
      </button>
    </form>
  );
}
