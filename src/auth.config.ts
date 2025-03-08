import Google from "next-auth/providers/google";
// import Resend from "next-auth/providers/resend"
import type { NextAuthConfig } from "next-auth"
 
// Notice this is only an object, not a full Auth.js instance
export default {
  providers: [Google],
} satisfies NextAuthConfig