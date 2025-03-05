import NextAuth from "next-auth"
import { TypeORMAdapter } from "@auth/typeorm-adapter"
import Google from "next-auth/providers/google"
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  pages: {
    signIn: "/login",
  },
  adapter: TypeORMAdapter(process.env.AUTH_TYPEORM_CONNECTION),
})