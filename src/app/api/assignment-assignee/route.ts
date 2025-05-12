import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { DataSource } from "typeorm";
import { typeormOptions } from "@/typeorm-datasource";
import { assignUserToAssignment } from "@/lib/assignAssignment";
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

    const ds = await getDataSource();
    await assignUserToAssignment(ds, assignmentId, userId);
    await ds.destroy();

    return NextResponse.json({ message: "User assigned to assignment successfully." }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const assignmentId = Number(searchParams.get("assignmentId"));
    const userId = searchParams.get("userId");

    if (!assignmentId || !userId) {
      return NextResponse.json(
        { error: "assignmentId and userId are required" },
        { status: 400 }
      );
    }

    const ds = await getDataSource();
    const assigneeRepo = ds.getRepository(AssignmentAssignee);

    // 1️⃣ Remove the AssignmentAssignee row
    const existing = await assigneeRepo.findOne({
      where: {
        assignment: { id: assignmentId },
        user: { id: userId },
      },
      relations: ["assignment", "user"],
    });
    if (!existing) {
      await ds.destroy();
      return NextResponse.json(
        { error: "AssignmentAssignee not found" },
        { status: 404 }
      );
    }
    await assigneeRepo.remove(existing);

    // 2️⃣ Remove the corresponding calendar event via QueryBuilder
    await ds
      .getRepository(Event)
      .createQueryBuilder()
      .delete()
      .from(Event)
      .where("assignmentId = :aid", { aid: assignmentId })
      .andWhere("userId = :uid", { uid: userId })
      .andWhere("eventType = :etype", { etype: "assignment" })
      .execute();

    await ds.destroy();
    return NextResponse.json(
      { message: "User unassigned and event deleted" },
      { status: 200 }
    );
  } catch (err) {
    console.error("DELETE /api/assignment-assignees error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
