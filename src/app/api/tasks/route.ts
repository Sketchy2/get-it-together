import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { DataSource } from "typeorm";
import { typeormOptions } from "@/typeorm-datasource";
import { Task } from "@/entities/Tasks";
import { UserEntity } from "@/entities/auth-entities";
import { Assignment } from "@/entities/Assignments";

/**
 * Helper: create a fresh connection
 */
async function getDataSource() {
  const dataSource = new DataSource(typeormOptions);
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }
  return dataSource;
}

/**
 * GET /api/tasks
 * Fetch all tasks
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dataSource = await getDataSource();
    const repo = dataSource.getRepository(Task);

    const tasks = await repo.find({ relations: ["assignees"] });
    await dataSource.destroy();

    return NextResponse.json(tasks);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * POST /api/tasks
 * Create a new task
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, status, priority, dueDate, assignmentId } = await req.json();

    if (!title || !status || !assignmentId) {
      return NextResponse.json({ error: "Title, Status, and AssignmentId are required" }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const taskRepo = dataSource.getRepository(Task);
    const userRepo = dataSource.getRepository(UserEntity);
    const assignmentRepo = dataSource.getRepository(Assignment);

    const user = await userRepo.findOneBy({ id: session.user.id as any });
    if (!user) {
      await dataSource.destroy();
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const assignment = await assignmentRepo.findOne({ where: { id: assignmentId } });
    if (!assignment) {
      await dataSource.destroy();
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    const task = taskRepo.create({
      title,
      description: description || null,
      status,
      priority: priority ?? null,
      dueDate: dueDate ? new Date(dueDate) : null,
      createdByUser: user,
      assignment,
    });

    const savedTask = await taskRepo.save(task);
    await dataSource.destroy();

    return NextResponse.json(savedTask, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * PUT /api/tasks?id={taskId}
 * Update an existing task
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dataSource = await getDataSource();
    const repo = dataSource.getRepository(Task);

    const { searchParams } = new URL(req.url);
    const id = parseInt(searchParams.get("id") || "");

    if (isNaN(id)) {
      await dataSource.destroy();
      return NextResponse.json({ error: "Invalid Task ID" }, { status: 400 });
    }

    const existingTask = await repo.findOne({ where: { id } });
    if (!existingTask) {
      await dataSource.destroy();
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const updateData = await req.json();

    repo.merge(existingTask, updateData);
    const updatedTask = await repo.save(existingTask);

    await dataSource.destroy();
    return NextResponse.json(updatedTask);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * DELETE /api/tasks?id={taskId}
 * Delete a task
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dataSource = await getDataSource();
    const repo = dataSource.getRepository(Task);

    const { searchParams } = new URL(req.url);
    const id = parseInt(searchParams.get("id") || "");

    if (isNaN(id)) {
      await dataSource.destroy();
      return NextResponse.json({ error: "Invalid Task ID" }, { status: 400 });
    }

    const task = await repo.findOne({ where: { id } });
    if (!task) {
      await dataSource.destroy();
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    await repo.remove(task);
    await dataSource.destroy();

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
