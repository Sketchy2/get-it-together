import NextAuth from "next-auth";
import { TypeORMAdapter } from "@auth/typeorm-adapter";
import authConfig from "./auth.config";
import { typeormOptions } from "./typeorm-datasource";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: TypeORMAdapter(typeormOptions),
  ...authConfig,
});
