"use client";

import { useState } from "react";
import { signIn } from "@/auth";
import "./EmailSignIn.css";
import { toast } from "react-hot-toast";

export default function EmailSignIn() {
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData) {
    const email = formData.get("email")?.toString().trim();

    if (!email) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setPending(true);
      await signIn("nodemailer", formData);
      toast.success("Sign-in link sent!");
    } catch (err) {
      console.error(err);
      toast.error("Sign-in failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <input
        className="rect"
        type="email"
        name="email"
        placeholder="Enter Email Address"
        disabled={pending}
      />
      <button
        className="rect signInButton"
        type="submit"
        disabled={pending}
      >
        {pending ? "Sending..." : "Sign in with Email"}
      </button>
    </form>
  );
}
