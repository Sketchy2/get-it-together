import Google from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer"
import type { NextAuthConfig } from "next-auth"
 
// Notice this is only an object, not a full Auth.js instance
export default {
  providers: [Google({allowDangerousEmailAccountLinking: true}), Nodemailer({
    server: process.env.EMAIL_SERVER,
    from: process.env.EMAIL_FROM,
  }),],
  session: {
    strategy: "jwt",
  },
} satisfies NextAuthConfig