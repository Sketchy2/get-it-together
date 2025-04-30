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
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dataSource = await getDataSource();
    const repo = dataSource.getRepository(Assignment);

    const assignments = await repo.find({
      relations: ["assignees", "tasks"], // 🔥 load tasks too
    });

    await dataSource.destroy();

    return NextResponse.json(assignments);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * POST /api/assignments
 * Create a new assignment
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    console.log("Session:", session);
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
    await dataSource.destroy();

    return NextResponse.json(savedAssignment, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * PUT /api/assignments?id={assignmentId}
 * Update an existing assignment
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dataSource = await getDataSource();
    const repo = dataSource.getRepository(Assignment);

    const { searchParams } = new URL(req.url);
    const id = parseInt(searchParams.get("id") || "");

    if (isNaN(id)) {
      await dataSource.destroy();
      return NextResponse.json({ error: "Invalid Assignment ID" }, { status: 400 });
    }

    const existingAssignment = await repo.findOne({ where: { id } });
    if (!existingAssignment) {
      await dataSource.destroy();
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    const updateData = await req.json();
    repo.merge(existingAssignment, updateData);

    const updatedAssignment = await repo.save(existingAssignment);
    await dataSource.destroy();

    return NextResponse.json(updatedAssignment);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * DELETE /api/assignments?id={assignmentId}
 * Delete an assignment
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dataSource = await getDataSource();
    const repo = dataSource.getRepository(Assignment);

    const { searchParams } = new URL(req.url);
    const id = parseInt(searchParams.get("id") || "");

    if (isNaN(id)) {
      await dataSource.destroy();
      return NextResponse.json({ error: "Invalid Assignment ID" }, { status: 400 });
    }

    const assignment = await repo.findOne({ where: { id } });
    if (!assignment) {
      await dataSource.destroy();
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    await repo.remove(assignment);
    await dataSource.destroy();

    return NextResponse.json({ message: "Assignment deleted successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
