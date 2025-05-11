import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { DataSource } from "typeorm";
import { typeormOptions } from "@/typeorm-datasource";
import { Assignment } from "@/entities/Assignments";
import { UserEntity } from "@/entities/auth-entities";
import { AssignmentAssignee } from "@/entities/AssignmentAssignee";

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
  const session = await auth();
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ds = await getDataSource();
  try {
    const assignments = await ds
      .getRepository(Assignment)
      .createQueryBuilder("assignment")
      // join in your assignees
      .leftJoinAndSelect("assignment.assignees", "assignee")
      // join the user on each assignee
      .leftJoinAndSelect("assignee.user", "user")
      // join any other relations you need
      .leftJoinAndSelect("assignment.tasks", "task")
      // filter by the logged-in user’s email
      .where("user.email = :email", { email })
      .getMany();

    return NextResponse.json(assignments);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    await ds.destroy();
  }
}

/**
 * POST /api/assignments
 * Create a new assignment
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description, weighting, deadline, progress, status, finalGrade } = await req.json();
  if (!title || !status) {
    return NextResponse.json({ error: "Title and Status are required" }, { status: 400 });
  }

  const ds = await getDataSource();
  try {
    const assignmentRepo = ds.getRepository(Assignment);
    const assigneeRepo   = ds.getRepository(AssignmentAssignee);
    const userRepo       = ds.getRepository(UserEntity);

    // Find the creator by email
    const creator = await userRepo.findOne({ where: { email } });
    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    // Create & save the assignment
    const assignment = assignmentRepo.create({
      title,
      description:   description   ?? null,
      weighting:     weighting     ?? null,
      deadline:      deadline      ? new Date(deadline) : null,
      progress:      progress      ?? 0,
      status,
      finalGrade:    finalGrade    ?? null,
      createdByUser: creator,
    });
    const saved = await assignmentRepo.save(assignment);

    // Assign the creator by email
    const creatorAssignee = assigneeRepo.create({
      assignment: saved,
      user:       creator,
    });
    await assigneeRepo.save(creatorAssignee);

    return NextResponse.json(saved, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    await ds.destroy();
  }
}