// app/api/task/route.ts
import { NextResponse } from "next/server";
import { AppDataSource } from "@database/ormconfig";
import { Task } from "@entities/Task";

export async function GET() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("Database initialized");
    } else {
      console.log("Database already initialized");
    }
    
    const taskRepo = AppDataSource.getRepository(Task);
    const tasks = await taskRepo.find();

    return NextResponse.json(tasks);
  } catch (error) {
    if (error instanceof Error) {
      console.error("❌ Error handling request:", error.message);
      console.error(error.stack);
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      console.error("❌ Unknown error:", error);
      return NextResponse.json({ error: "Unknown error occurred" }, { status: 500 });
    }
  }
}
