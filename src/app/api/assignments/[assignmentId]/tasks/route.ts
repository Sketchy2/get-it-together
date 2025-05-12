// src/app/api/assignments/[assignmentId]/tasks/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { DataSource } from "typeorm";
import { typeormOptions } from "@/typeorm-datasource";
import { Assignment } from "@/entities/Assignments";
import { Task, Priority } from "@/entities/Tasks";
import { UserEntity } from "@/entities/auth-entities";

async function getDataSource() {
  const ds = new DataSource(typeormOptions);
  if (!ds.isInitialized) {
    console.log("Initializing DataSource");
    await ds.initialize();
  }
  return ds;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  console.log("POST /api/assignments/:id/tasks", params);

  const session = await auth();
  console.log("Session:", session);
  if (!session?.user?.email) {
    console.log(" → Unauthorized");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const assignmentId = parseInt(params.assignmentId, 10);
  console.log("Parsed assignmentId:", assignmentId);
  if (isNaN(assignmentId)) {
    console.log(" → Invalid assignmentId");
    return NextResponse.json({ error: "Invalid assignment ID" }, { status: 400 });
  }

  let body: any;
  try {
    body = await req.json();
    console.log("Request body:", body);
  } catch (e) {
    console.error(" → Invalid JSON:", e);
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { title, description, dueDate } = body;
  console.log("Parsed fields:", { title, description, dueDate });
  if (!title || typeof title !== "string" || !title.trim()) {
    console.log(" → Validation failed: title required");
    return NextResponse.json({ error: "Task title is required" }, { status: 400 });
  }

  const ds = await getDataSource();
  try {
    const asgRepo    = ds.getRepository(Assignment);
    const assignment = await asgRepo.findOneBy({ id: assignmentId });
    console.log("Loaded assignment:", assignment);
    if (!assignment) {
      console.log(" → Assignment not found");
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    const userRepo = ds.getRepository(UserEntity);
    const creator  = await userRepo.findOne({ where: { email: session.user.email } });
    console.log("Loaded creator user:", creator);
    if (!creator) {
      console.log(" → Creator user not found");
      return NextResponse.json({ error: "Creator user not found" }, { status: 404 });
    }

    // ---- NEW: manually instantiate Task to avoid the create() overload issue ----
    const task = new Task();
    task.title         = title.trim();
    task.description   = description ?? null;
    task.status        = "To-Do";
    task.priority      = Priority.Medium;
    task.deadline      = dueDate ? new Date(dueDate) : null;
    task.createdByUser = creator;
    task.assignment    = assignment;
    task.assignees     = [];  // start empty

    console.log("Saving task:", task);
    const saved = await ds.getRepository(Task).save(task);
    console.log("Task saved:", saved);

    return NextResponse.json(saved, { status: 201 });
  } catch (err) {
    console.error("Error in POST handler:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    console.log("Destroying DataSource");
    await ds.destroy();
  }
}
