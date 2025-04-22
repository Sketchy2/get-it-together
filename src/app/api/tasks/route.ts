/**
 * API Routes for Task entity CRUD operations.
 * Uses Next.js Edge runtime and TypeORM for database access.
 */

import { NextRequest, NextResponse } from "next/server";
import { AppDataSource } from "@/auth";
import { Task } from "@/entities/Tasks";

/**
 * Initializes the database connection if not already initialized.
 * Ensures AppDataSource is ready before any DB operations.
 */
async function initDB(): Promise<void> {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    console.log("Database initialized");
  }
}

/**
 * GET /api/tasks
 * Fetches all tasks along with their assignees.
 *
 * @returns JSON array of Task objects
 */
export async function GET(): Promise<NextResponse> {
  try {
    await initDB();
    const repo = AppDataSource.getRepository(Task);
    const tasks = await repo.find({ relations: ["assignees"] });
    return NextResponse.json(tasks);
  } catch (err) {
    return handleError(err);
  }
}

/**
 * POST /api/tasks
 * Creates a new task.
 *
 * Expects a JSON body with:
 * - title (string) required
 * - description (string) optional
 * - status ("To-Do" | "In Progress" | "Completed") required
 * - priority (number) optional
 * - dueDate (ISO string) optional
 *
 * @param req NextRequest containing task data
 * @returns JSON of saved Task with status 201 or error JSON
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await initDB();
    const { title, description, status, priority, dueDate } = await req.json();

    if (!title || !status) {
      return NextResponse.json(
        { error: "Title and status are required" },
        { status: 400 }
      );
    }

    const repo = AppDataSource.getRepository(Task);
    const newTask = repo.create({
      title,
      description: description ?? null,
      status,
      priority: priority ?? null,
      dueDate: dueDate ? new Date(dueDate) : null,
    });

    const saved = await repo.save(newTask);
    return NextResponse.json(saved, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}

/**
 * PUT /api/tasks?id={id}
 * Updates an existing task by ID.
 *
 * Expects query param id and JSON body with any updatable fields.
 *
 * @param req NextRequest containing id and update data
 * @returns JSON of updated Task or error JSON
 */
export async function PUT(req: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(req.url);
    const idParam = url.searchParams.get("id");
    if (!idParam) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 }
      );
    }
    const taskId = Number(idParam);
    if (isNaN(taskId)) {
      return NextResponse.json(
        { error: "Invalid Task ID" },
        { status: 400 }
      );
    }

    await initDB();
    const repo = AppDataSource.getRepository(Task);
    const task = await repo.findOneBy({ id: taskId });
    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    const { title, description, status, priority, dueDate } = await req.json();
    if (title       !== undefined) task.title       = title;
    if (description !== undefined) task.description = description;
    if (status      !== undefined) task.status      = status;
    if (priority    !== undefined) task.priority    = priority;
    if (dueDate     !== undefined) task.dueDate     = dueDate ? new Date(dueDate) : null;

    const updated = await repo.save(task);
    return NextResponse.json(updated);
  } catch (err) {
    return handleError(err);
  }
}

/**
 * DELETE /api/tasks?id={id}
 * Deletes a task by ID.
 *
 * Expects query param id.
 *
 * @param req NextRequest containing id
 * @returns JSON confirmation message or error JSON
 */
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(req.url);
    const idParam = url.searchParams.get("id");
    if (!idParam) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 }
      );
    }
    const taskId = Number(idParam);
    if (isNaN(taskId)) {
      return NextResponse.json(
        { error: "Invalid Task ID" },
        { status: 400 }
      );
    }

    await initDB();
    const repo = AppDataSource.getRepository(Task);

    const task = await repo.findOneBy({ id: taskId });
    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    await repo.delete(taskId);
    return NextResponse.json(
      { message: `Task ${taskId} deleted` },
      { status: 200 }
    );
  } catch (err) {
    return handleError(err);
  }
}

/**
 * Standard error handler for API routes.
 * Logs the error and returns a 500 response.
 *
 * @param error Unknown error object
 * @returns JSON error response with status 500
 */
function handleError(error: unknown): NextResponse {
  console.error("❌", error);
  const msg = error instanceof Error ? error.message : "Unknown error";
  return NextResponse.json({ error: msg }, { status: 500 });
}
