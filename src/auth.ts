import NextAuth from "next-auth"
import OracleAdapter  from "@/utils/OracleDBAdapter"
import Google from "next-auth/providers/google"
import oracledb from 'oracledb';  

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

const client = oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      connectString: process.env.DB_CONNECTSRTING
  });
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  pages: {
    signIn: "/login",
  },
  adapter: OracleAdapter(await client),
})