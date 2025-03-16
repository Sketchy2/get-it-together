import NextAuth from "next-auth";
import authConfig from "./auth.config"
import { TypeORMAdapter } from "@auth/typeorm-adapter";
import * as defaultEntities from "@/entities/auth-entities"
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { DataSourceOptions } from "typeorm"
import { UserEntity } from "@auth/typeorm-adapter/entities";

const db_connect = process.env.AUTH_TYPEORM_CONNECTION;
if (!db_connect) {
  throw new Error('Database connection string is not defined, check env & env.local are defined');
  
}

const connection: DataSourceOptions = {
  type: "oracle",
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  connectString: process.env.DB_CONNECT_STRING,
  synchronize: true  , // TODO: TURN INTO FALSE WHEN PROD
  logging: ["query", "error"],
  migrations: ["migration/*.ts"],
  namingStrategy: new SnakeNamingStrategy(),
}
 
const entities = {
  UserEntity: defaultEntities.User,
  SessionEntity: defaultEntities.Session,
  VerificationTokenEntity: defaultEntities.VerificationToken,
  AccountEntity: defaultEntities.Account,

}

// have to use jwt due to https://authjs.dev/guides/edge-compatibility
export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: TypeORMAdapter(connection,{entities}), // Database adapter
  ...authConfig
});
