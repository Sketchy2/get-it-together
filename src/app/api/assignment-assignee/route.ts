import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { DataSource } from "typeorm";
import { typeormOptions } from "@/typeorm-datasource";
import { AssignmentAssignee } from "@/entities/AssignmentAssignee";
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
 * PUT /api/assignment-assignees
 * Assign a user to an assignment
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { assignmentId, userId } = await req.json();

    if (!assignmentId || !userId) {
      return NextResponse.json({ error: "assignmentId and userId are required" }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const assigneeRepo = dataSource.getRepository(AssignmentAssignee);
    const assignmentRepo = dataSource.getRepository(Assignment);
    const userRepo = dataSource.getRepository(UserEntity);

    const assignment = await assignmentRepo.findOne({ where: { id: assignmentId } });
    const user = await userRepo.findOne({ where: { id: userId } });

    if (!assignment || !user) {
      await dataSource.destroy();
      return NextResponse.json({ error: "Assignment or User not found" }, { status: 404 });
    }

    // Create new assignment assignee
    const assignmentAssignee = assigneeRepo.create({
      assignment,
      user,
    });

    const savedAssignee = await assigneeRepo.save(assignmentAssignee);
    await dataSource.destroy();

    return NextResponse.json(savedAssignee, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * DELETE /api/assignment-assignees?assignmentId=123&userId=456
 * Remove a user from an assignment
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const assignmentId = parseInt(searchParams.get("assignmentId") || "");
    const userId = parseInt(searchParams.get("userId") || "");

    if (isNaN(assignmentId) || isNaN(userId)) {
      return NextResponse.json({ error: "assignmentId and userId must be numbers" }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const assigneeRepo = dataSource.getRepository(AssignmentAssignee);

    const existingAssignee = await assigneeRepo.findOne({
        where: {
          assignment: { id: assignmentId },
          user: { id: userId.toString() },
        },
        relations: ["assignment", "user"],
      });
      

    if (!existingAssignee) {
      await dataSource.destroy();
      return NextResponse.json({ error: "AssignmentAssignee not found" }, { status: 404 });
    }

    await assigneeRepo.remove(existingAssignee);
    await dataSource.destroy();

    return NextResponse.json({ message: "User removed from assignment" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}