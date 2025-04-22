/**
 * API Routes for Group entity CRUD operations.
 * Uses Next.js Edge runtime and TypeORM for database access.
 */

import { NextRequest, NextResponse } from "next/server";
import { AppDataSource } from "@/auth";
import { Group } from "@/entities/Groups";

/**
 * Initializes the database connection if not already initialized.
 */
async function initDB(): Promise<void> {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    console.log("Database initialized");
  }
}

/**
 * GET /api/groups
 * Fetches all groups along with their creator and members.
 */
export async function GET(): Promise<NextResponse> {
  try {
    await initDB();
    const repo = AppDataSource.getRepository(Group);
    const groups = await repo.find({ relations: ["creator", "members"] });
    return NextResponse.json(groups);
  } catch (err) {
    return handleError(err);
  }
}

/**
 * POST /api/groups
 * Creates a new group.
 *
 * Expects JSON body with:
 * - name (string)
 * - createdById (UUID of the user who created it)
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await initDB();
    const { name, createdById } = await req.json();

    if (!name || !createdById) {
      return NextResponse.json(
        { error: "Group name and createdById are required" },
        { status: 400 }
      );
    }

    const repo = AppDataSource.getRepository(Group);
    const group = repo.create({
      name,
      creator: { id: createdById },
    });
    const saved = await repo.save(group);
    return NextResponse.json(saved, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}

/**
 * PUT /api/groups?id={id}
 * Updates an existing group by ID.
 *
 * Expects query param id and JSON body with updatable fields.
 */
export async function PUT(req: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { error: "Valid group ID is required" },
        { status: 400 }
      );
    }

    await initDB();
    const repo = AppDataSource.getRepository(Group);
    const group = await repo.findOneBy({ id: Number(id) });

    if (!group) {
      return NextResponse.json(
        { error: "Group not found" },
        { status: 404 }
      );
    }

    const { name, creator } = await req.json();
    if (name !== undefined) group.name = name;
    if (creator !== undefined) group.creator = creator;

    const updated = await repo.save(group);
    return NextResponse.json(updated);
  } catch (err) {
    return handleError(err);
  }
}

/**
 * DELETE /api/groups?id={id}
 * Deletes a group by ID.
 */
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { error: "Valid group ID is required" },
        { status: 400 }
      );
    }

    await initDB();
    const repo = AppDataSource.getRepository(Group);
    const group = await repo.findOneBy({ id: Number(id) });

    if (!group) {
      return NextResponse.json(
        { error: "Group not found" },
        { status: 404 }
      );
    }

    await repo.delete(group.id);
    return NextResponse.json(
      { message: `Group ${group.id} deleted` },
      { status: 200 }
    );
  } catch (err) {
    return handleError(err);
  }
}

/**
 * Logs and handles unexpected errors
 */
function handleError(error: unknown): NextResponse {
  console.error("❌", error);
  const msg = error instanceof Error ? error.message : "Unknown error";
  return NextResponse.json({ error: msg }, { status: 500 });
}
