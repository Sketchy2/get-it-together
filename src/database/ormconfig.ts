import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "oracle",
  host: "adb.ap-melbourne-1.oraclecloud.com",
  port: 1522,
  username: "ADMIN",
  password: "GetItTogether!Database1",
  serviceName: "g70cfee5a573e65_gitdb_high.adb.oraclecloud.com",
  synchronize: true, // Auto-sync schema changes for now
  logging: true,
  extra: {
    poolMax: 10,   // ✅ Increase max connections
    poolMin: 2,    // ✅ Keep some connections alive
    poolIncrement: 1,
    poolTimeout: 60, // ✅ Avoid idle disconnects
    enableStatistics: true, // ✅ Debugging
    stmtCacheSize: 40, // ✅ Caching
  },
  entities: ["src/entities/**/*.ts"],
});


export const connectDB = async () => {
  try {
    await AppDataSource.initialize();
    console.log("✅ Database connected successfully!");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
};
