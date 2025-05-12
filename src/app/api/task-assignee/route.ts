import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { DataSource } from "typeorm";
import { typeormOptions } from "@/typeorm-datasource";
import { TaskAssignee } from "@/entities/TaskAssignee";
import { Task } from "@/entities/Tasks";
import { UserEntity } from "@/entities/auth-entities";
import { Assignment } from "@/entities/Assignments";
import { Event } from "@/entities/Event";



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
 * PUT /api/task-assignees
 * Assign a user to a task
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId, userId } = await req.json();

    if (!taskId || !userId) {
      return NextResponse.json({ error: "taskId and userId are required" }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const assigneeRepo = dataSource.getRepository(TaskAssignee);
    const taskRepo = dataSource.getRepository(Task);
    const userRepo = dataSource.getRepository(UserEntity);

    const task = await taskRepo.findOne({ where: { id: taskId } });
    const user = await userRepo.findOne({ where: { id: userId } }); // userId already a string (UUID)

    if (!task || !user) {
      await dataSource.destroy();
      return NextResponse.json({ error: "Task or User not found" }, { status: 404 });
    }

    const taskAssignee = assigneeRepo.create({
      task,
      user,
    });

    const savedAssignee = await assigneeRepo.save(taskAssignee);

    const eventRepo = dataSource.getRepository(Event);
    const assignment = task.assignment || await dataSource.getRepository(Assignment).findOne({
      where: { tasks: { id: task.id } },
      relations: ["tasks"],
    });
    
    const event = eventRepo.create({
      title: task.title,
      start: task.deadline || assignment?.deadline || new Date(),
      end: task.deadline || assignment?.deadline || new Date(),
      description: task.description || `Task for ${assignment?.title ?? "an assignment"}`,
      eventType: "task",
      color: "#2ECC71",
      assignment: assignment || undefined,
      assignmentId: assignment?.id,
      user: user,
      userId: user.id,
    });
    
    await eventRepo.save(event);
    await dataSource.destroy();
    
    return NextResponse.json(savedAssignee, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * DELETE /api/task-assignees?taskId=123&userId=456
 * Remove a user from a task
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const taskId = parseInt(searchParams.get("taskId") || "");
    const userId = searchParams.get("userId"); // keep as string

    if (isNaN(taskId) || !userId) {
      return NextResponse.json({ error: "taskId and userId must be valid" }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const assigneeRepo = dataSource.getRepository(TaskAssignee);

    const existingAssignee = await assigneeRepo.findOne({
      where: {
        task: { id: taskId },
        user: { id: userId }, // userId is a string
      },
      relations: ["task", "user"],
    });

    if (!existingAssignee) {
      await dataSource.destroy();
      return NextResponse.json({ error: "TaskAssignee not found" }, { status: 404 });
    }

    await assigneeRepo.remove(existingAssignee);
    await dataSource.destroy();

    return NextResponse.json({ message: "User removed from task" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
