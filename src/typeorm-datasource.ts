import {
  UserEntity,
  AccountEntity,
  SessionEntity,
  VerificationTokenEntity,
} from "./entities/auth-entities";
import { Task } from "./entities/Tasks";
import { TaskAssignee } from "./entities/TaskAssignee";
import { Assignment } from "./entities/Assignments";
import { AssignmentAssignee } from "./entities/AssignmentAssignee";

if (!process.env.DATABASE_URL) {
  throw new Error("❌ DATABASE_URL is not defined in .env");
}

const dbUrl = new URL(process.env.DATABASE_URL);
const routingId = dbUrl.searchParams.get("options");
dbUrl.searchParams.delete("options");

export const typeormOptions = {
  type: "cockroachdb" as const,
  url: dbUrl.toString(),
  ssl: true,
  timeTravelQueries: false,
  extra: { options: routingId },
  synchronize: true,
  logging: ["query", "error"] as const,
  entities: [
    UserEntity,
    AccountEntity,
    SessionEntity,
    VerificationTokenEntity,
    Task,
    TaskAssignee,
    Assignment,
    AssignmentAssignee,
  ],
};
