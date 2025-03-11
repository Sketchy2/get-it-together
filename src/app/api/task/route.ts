import { NextRequest, NextResponse } from "next/server";
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
    return handleError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, description, status, priority, due_date } = await req.json();

    if (!title || !status) {
      return NextResponse.json(
        { error: "Title and status are required" },
        { status: 400 }
      );
    }

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const taskRepo = AppDataSource.getRepository(Task);
    const newTask = taskRepo.create({
      title,
      description,
      status,
      priority,
      due_date: due_date ? new Date(due_date) : null,
    });

    const savedTask = await taskRepo.save(newTask);
    return NextResponse.json(savedTask, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const taskId = url.searchParams.get("id");

    if (!taskId) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 }
      );
    }

    const { title, description, status, priority, due_date } = await req.json();

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const taskRepo = AppDataSource.getRepository(Task);
    const task = await taskRepo.findOneBy({ task_id: Number(taskId) });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    task.title = title ?? task.title;
    task.description = description ?? task.description;
    task.status = status ?? task.status;
    task.priority = priority ?? task.priority;
    task.due_date = due_date ? new Date(due_date) : task.due_date;

    const updatedTask = await taskRepo.save(task);
    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error) {
    return handleError(error);
  }
}

// Helper function for error handling
function handleError(error: unknown) {
  if (error instanceof Error) {
    console.error("❌ Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    console.error("❌ Unknown error:", error);
    return NextResponse.json({ error: "Unknown error occurred" }, { status: 500 });
  }
}
