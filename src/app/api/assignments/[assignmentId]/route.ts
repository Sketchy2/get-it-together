import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { DataSource } from "typeorm";
import { typeormOptions } from "@/typeorm-datasource";
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


//Update assignment by ID
// PUT /api/assignments/[assignmentId]

export async function PUT(
    req: NextRequest,
    { params }: { params: { assignmentId: string } }
  ) {
    try {
      const session = await auth();
      if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
  
      const assignmentId = parseInt(params.assignmentId);
      if (isNaN(assignmentId)) {
        return NextResponse.json({ error: "Invalid Assignment ID" }, { status: 400 });
      }
  
      const updateData = await req.json();
      const dataSource = await getDataSource();
      const repo = dataSource.getRepository(Assignment);
  
      const assignment = await repo.findOne({ where: { id: assignmentId } });
      if (!assignment) {
        await dataSource.destroy();
        return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
      }
  
      repo.merge(assignment, updateData);
      const updatedAssignment = await repo.save(assignment);
  
      await dataSource.destroy();
      return NextResponse.json(updatedAssignment);
    } catch (err) {
      console.error(err);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }

  //Delete assignment by ID
  // DELETE /api/assignments/[assignmentId]

  export async function DELETE(
    req: NextRequest,
    { params }: { params: { assignmentId: string } }
  ) {
    try {
      const session = await auth();
      if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
  
      const assignmentId = parseInt(params.assignmentId);
      if (isNaN(assignmentId)) {
        return NextResponse.json({ error: "Invalid Assignment ID" }, { status: 400 });
      }
  
      const dataSource = await getDataSource();
      const repo = dataSource.getRepository(Assignment);
  
      const assignment = await repo.findOne({ where: { id: assignmentId } });
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const repo = dataSource.getRepository(Assignment);

    const assignments = await repo
      .createQueryBuilder("assignment")
      .leftJoinAndSelect("assignment.assignees", "assignee")
      .leftJoinAndSelect("assignee.user", "user")
      .where("user.id = :userId", { userId })
      .getMany();

    await dataSource.destroy();
    return NextResponse.json(assignments);
  } catch (err) {
    console.error("GET /api/assignments/user error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
