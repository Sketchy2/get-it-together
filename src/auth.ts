import NextAuth from "next-auth";
import authConfig from "./auth.config"
import { TypeORMAdapter } from "@auth/typeorm-adapter";
import { User } from "@/entities/User";
import { Session } from "@/entities/Session";
import { Account } from "@/entities/Account";
import { TaskAssignee } from "@/entities/TaskAssignee";
import { Task } from "@/entities/Task";
import { VerificationToken } from "@/entities/VerificationToken";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { DataSourceOptions } from "typeorm"

const db_connect = process.env.AUTH_TYPEORM_CONNECTION;
if (!db_connect) {
  throw new Error('Database connection string is not defined, check env & env.local are defined');
  
}

const connection: DataSourceOptions = {
  type: "oracle",
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  connectString: process.env.DB_CONNECT_STRING,
  synchronize: false , // TODO: TURN INTO FALSE WHEN PROD
  logging: ["query", "error"],
  entities: [User, Session, Account, TaskAssignee, Task, VerificationToken],
  namingStrategy: new SnakeNamingStrategy(),
}
 

const entities = {
  UserEntity: User,
  SessionEntity: Session,
  AccountEntity: Account,
  VerificationTokenEntity:
  VerificationToken,
}

// have to use jwt due to https://authjs.dev/guides/edge-compatibility
export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: TypeORMAdapter(connection,{entities}), // Database adapter
  ...authConfig
});
