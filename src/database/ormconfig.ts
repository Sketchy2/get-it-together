import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { Session } from "../entities/Session";
import { Account } from "../entities/Account";
import { TaskAssignee } from "../entities/TaskAssignee";
import { Task } from "../entities/Task";
import { VerificationToken } from "../entities/VerificationToken";


export const AppDataSource = new DataSource({
  type: "oracle",
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  connectString: process.env.DB_CONNECT_STRING,
  synchronize: false,
  logging: ["query", "error"],
  entities: [User, Session, Account, TaskAssignee, Task, VerificationToken]
});





export const connectDB = async () => {
  console.log("connectdbing")
  try {
    await AppDataSource.initialize();
    console.log("✅ Database connected successfully!");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
};
