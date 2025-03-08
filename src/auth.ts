import NextAuth from "next-auth"
import OracleAdapter  from "@/utils/OracleDBAdapter"
import Google from "next-auth/providers/google"
import clientPromise from "./utils/OracleDBConnection"
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  pages: {
    signIn: "/login",
  },
  adapter: OracleAdapter(clientPromise),
})