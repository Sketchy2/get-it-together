import NextAuth from "next-auth";
import authConfig from "./auth.config"
import clientPromise from "@/utils/OracleDBConnection";
import OracleAdapter from "@/utils/OracleDBAdapter";


// have to use jwt due to https://authjs.dev/guides/edge-compatibility
export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: OracleAdapter(clientPromise), // Database adapter
  ...authConfig
});
