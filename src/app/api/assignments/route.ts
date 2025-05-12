import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { DataSource } from "typeorm";
import { typeormOptions } from "@/typeorm-datasource";
import { Assignment } from "@/entities/Assignments";
import { UserEntity } from "@/entities/auth-entities";

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
 * GET /api/assignments
 * Fetch all assignments (with assignees and tasks)
 */
export async function GET() {
  try {
    // Authenticate the user
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all assignments, including related assignees and tasks
    const dataSource = await getDataSource();
    const repo = dataSource.getRepository(Assignment);

    const assignments = await repo.find({
      relations: ["assignees", "tasks"],
    });

    await dataSource.destroy();
    return NextResponse.json(assignments);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

import { AssignmentAssignee } from "@/entities/AssignmentAssignee";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, weighting, deadline, progress, status, finalGrade } = await req.json();

    if (!title || !status) {
      return NextResponse.json({ error: "Title and Status are required" }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const assignmentRepo = dataSource.getRepository(Assignment);
    const userRepo = dataSource.getRepository(UserEntity);
    const assigneeRepo = dataSource.getRepository(AssignmentAssignee);

    const user = await userRepo.findOneBy({ id: session.user.id as any });
    if (!user) {
      await dataSource.destroy();
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const assignment = assignmentRepo.create({
      title,
      description: description || null,
      weighting: weighting ?? null,
      deadline: deadline ? new Date(deadline) : null,
      progress: progress ?? 0,
      status,
      finalGrade: finalGrade ?? null,
      createdByUser: user,
    });

    const savedAssignment = await assignmentRepo.save(assignment);

    // 🔁 Add creator as an assignee
    const assignee = assigneeRepo.create({
      assignment: savedAssignment,
      user,
    });
    await assigneeRepo.save(assignee);

    await dataSource.destroy();
    return NextResponse.json(savedAssignment, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

