import { NextRequest, NextResponse } from "next/server";
import { DataSource } from "typeorm";
import { typeormOptions } from "@/typeorm-datasource";
import { Assignment } from "@/entities/Assignments";

async function getDataSource() {
  const dataSource = new DataSource(typeormOptions);
  if (!dataSource.isInitialized) await dataSource.initialize();
  return dataSource;
}

// WILL RETREIEVE ALL ASSIGNMENTS FOR A SPECIFIC USER
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
