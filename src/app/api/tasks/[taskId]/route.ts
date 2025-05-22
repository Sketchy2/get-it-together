import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { DataSource } from "typeorm";
import { typeormOptions } from "@/typeorm-datasource";
import { Task } from "@/entities/Tasks";

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
 * GET /api/tasks/[taskId]
 * Fetch a single task by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const taskId = parseInt(params.taskId);
    if (isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid Task ID" }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const repo = dataSource.getRepository(Task);

    const task = await repo.findOne({ where: { id: taskId }, relations: ["assignees"] });

    await dataSource.destroy();

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * PUT /api/tasks/[taskId]
 * Update an existing task
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const taskId = parseInt(params.taskId);
    if (isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid Task ID" }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const repo = dataSource.getRepository(Task);

    const existingTask = await repo.findOne({ where: { id: taskId } });
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
 * DELETE /api/tasks/[taskId]
 * Delete a task
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { taskId: string } }
) {
      console.log("Attempting to delete"
    )
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const taskId = parseInt(params.taskId);
    if (isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid Task ID" }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const repo = dataSource.getRepository(Task);

    const task = await repo.findOne({ where: { id: taskId } });
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
