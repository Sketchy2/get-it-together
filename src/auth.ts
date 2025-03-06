import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import OracleAdapter from "@/libs/adapter-oracle/OracleDBAdapter"
import OracleDB from "oracledb";

const connectionDetails = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  connectString: process.env.DB_CONNECTSTRING, // Fixed typo here: DB_CONNECTSRTING -> DB_CONNECTSTRING
};

async function connect(): Promise<OracleDB.Connection> {
  return await OracleDB.getConnection(connectionDetails);
}


export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  pages: {
    signIn: "/login",
  },
  adapter: OracleAdapter(await connect())
})