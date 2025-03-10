import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { Session } from "../entities/Session";
import { Account } from "../entities/Account";
import { TaskAssignee } from "../entities/TaskAssignee";
import { Task } from "../entities/Task";
import { VerificationToken } from "../entities/VerificationToken";


export const AppDataSource = new DataSource({
  type: "oracle",
  username: "ADMIN",
  password: "GetItTogether!Database1",
  connectString: "(description=(retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1522)(host=adb.ap-melbourne-1.oraclecloud.com))(connect_data=(service_name=g70cfee5a573e65_gitdb_high.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))",
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
