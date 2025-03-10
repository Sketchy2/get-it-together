import { AppDataSource } from "../database/ormconfig";

export const initDB = async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    console.log("✅ Database initialized");
  }
};
