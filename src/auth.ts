import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { TypeORMAdapter } from "@auth/typeorm-adapter";
import * as defaultEntities from "@/entities/auth-entities";
import { User, Account, Session, VerificationToken } from "./entities/auth-entities";
import { Task } from "./entities/Tasks";
import { TaskAssignee } from "./entities/TaskAssignee";
import { DataSource } from "typeorm";
import { URL } from "url";
import dotenv from "dotenv";
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("❌ DATABASE_URL is not defined in .env");
}

const dbUrl = new URL(process.env.DATABASE_URL);
const routingId = dbUrl.searchParams.get("options");
dbUrl.searchParams.delete("options");

export const AppDataSource = new DataSource({
  type: "cockroachdb",
  url: dbUrl.toString(),
  ssl: true,
  timeTravelQueries: false,
  extra: {
    options: routingId
  },
  synchronize: true,
  logging: ["query", "error"],
  entities: [User, Account, Session, VerificationToken, Task, TaskAssignee],
});

const entities = {
  UserEntity: defaultEntities.User,
  AccountEntity: defaultEntities.Account,
  SessionEntity: defaultEntities.Session,
  VerificationTokenEntity: defaultEntities.VerificationToken,
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: TypeORMAdapter(AppDataSource.options, { entities }),
  ...authConfig,
});