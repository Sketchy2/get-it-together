"use client";

import { useState } from "react";
import "./EmailSignIn.css";
import { emailSignInAction } from "@/components/auth/EmailSignInAction";

export default function EmailSignIn() {
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData) {
    const email = formData.get("email")?.toString().trim();

    if (!email) {
      return;
    }

    try {
      setPending(true);
      await emailSignInAction(formData);
    } catch (err) {
      console.error(err);
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
