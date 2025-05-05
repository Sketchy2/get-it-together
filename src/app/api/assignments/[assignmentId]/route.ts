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

/**
 * GET /api/assignments/[assignmentId]
 * Fetch assignment by ID (with assignees and tasks)
 */
export async function GET(
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

    const assignment = await repo.findOne({
      where: { id: assignmentId },
      relations: ["assignees", "tasks"],
    });

    await dataSource.destroy();

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    return NextResponse.json(assignment);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
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
  
  