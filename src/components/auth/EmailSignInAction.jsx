"use server";

import { signIn } from "@/auth";

export async function emailSignInAction(formData) {
  const email = formData.get("email")?.toString().trim();

  if (!email) {
    throw new Error("Email is required");
  }

  await signIn("nodemailer", formData);
}
