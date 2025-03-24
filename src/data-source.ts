import { DataSource } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import dotenv from "dotenv";
import { Account, Session, User, VerificationToken } from "./entities/auth-entities";
import { TaskAssignee } from "./entities/TaskAssignee";
import { Task } from "./entities/Task";

dotenv.config();



export const AppDataSource = new DataSource({
  type: "oracle",
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  connectString: process.env.DB_CONNECT_STRING,
  synchronize: true  , // TODO: TURN INTO FALSE WHEN PROD
  logging: ["query", "error"],
  migrations: ["migration/*.ts"],
  entities: [User, Session, Account, TaskAssignee, Task, VerificationToken],
  namingStrategy: new SnakeNamingStrategy(),

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
