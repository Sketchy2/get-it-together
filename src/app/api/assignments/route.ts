/**
 * API Routes for Assignment entity CRUD operations.
 * Uses Next.js Edge runtime and TypeORM for database access.
 */

import { NextRequest, NextResponse } from "next/server";
import { AppDataSource } from "@/auth";
import { Assignment } from "@/entities/Assignments";

/**
 * Initializes the database connection if not already initialized.
 * Ensures AppDataSource is ready before any DB operations.
 */
async function initDB(): Promise<void> {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    console.log("Database initialized");
  }
}

/**
 * GET /api/assignments
 * Fetches all assignments along with their group relation.
 *
 * @returns JSON array of Assignment objects
 */
export async function GET(): Promise<NextResponse> {
  try {
    await initDB();
    const repo = AppDataSource.getRepository(Assignment);
    const assignments = await repo.find({ relations: ["group"] });
    return NextResponse.json(assignments);
  } catch (err) {
    return handleError(err);
  }
}

/**
 * POST /api/assignments
 * Creates a new assignment.
 *
 * Expects a JSON body with:
 * - title (string) required
 * - description (string) optional
 * - weighting (number) optional
 * - deadline (ISO string) optional
 * - progress (number 0–100) optional
 * - status (string) required
 * - finalGrade (number) optional
 * - createdBy (number) required
 * - groupId (number) required
 *
 * @param req NextRequest containing assignment data
 * @returns JSON of saved Assignment with status 201 or error JSON
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await initDB();
    const {
      title,
      description,
      weighting,
      deadline,
      progress,
      status,
      finalGrade,
      createdBy,
      groupId,
    } = await req.json();

    if (!title || !status || groupId === undefined || createdBy === undefined) {
      return NextResponse.json(
        { error: "Title, status, groupId and createdBy are required" },
        { status: 400 }
      );
    }

    const repo = AppDataSource.getRepository(Assignment);
    const newAssignment = repo.create({
      title,
      description: description ?? null,
      weighting: weighting ?? null,
      deadline: deadline ? new Date(deadline) : null,
      progress: progress ?? 0,
      status,
      finalGrade: finalGrade ?? null,
      createdBy,
      groupId,
    });

    const saved = await repo.save(newAssignment);
    return NextResponse.json(saved, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}

/**
 * PUT /api/assignments?id={id}
 * Updates an existing assignment by ID.
 *
 * Expects query param id and JSON body with any updatable fields.
 *
 * @param req NextRequest containing id and update data
 * @returns JSON of updated Assignment or error JSON
 */
export async function PUT(req: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(req.url);
    const idParam = url.searchParams.get("id");
    if (!idParam) {
      return NextResponse.json(
        { error: "Assignment ID is required" },
        { status: 400 }
      );
    }
    const assignmentId = Number(idParam);
    if (isNaN(assignmentId)) {
      return NextResponse.json(
        { error: "Invalid Assignment ID" },
        { status: 400 }
      );
    }

    await initDB();
    const repo = AppDataSource.getRepository(Assignment);
    const assignment = await repo.findOneBy({ id: assignmentId });
    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    const {
      title,
      description,
      weighting,
      deadline,
      progress,
      status,
      finalGrade,
      createdBy,
      groupId,
    } = await req.json();

    if (title       !== undefined) assignment.title       = title;
    if (description !== undefined) assignment.description = description;
    if (weighting  !== undefined) assignment.weighting  = weighting;
    if (deadline    !== undefined) assignment.deadline    = deadline ? new Date(deadline) : null;
    if (progress    !== undefined) assignment.progress    = progress;
    if (status      !== undefined) assignment.status      = status;
    if (finalGrade  !== undefined) assignment.finalGrade  = finalGrade;
    if (createdBy   !== undefined) assignment.createdBy   = createdBy;
    if (groupId     !== undefined) assignment.groupId     = groupId;

    const updated = await repo.save(assignment);
    return NextResponse.json(updated);
  } catch (err) {
    return handleError(err);
  }
}

/**
 * DELETE /api/assignments?id={id}
 * Deletes an assignment by ID.
 *
 * Expects query param id.
 *
 * @param req NextRequest containing id
 * @returns JSON confirmation message or error JSON
 */
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(req.url);
    const idParam = url.searchParams.get("id");
    if (!idParam) {
      return NextResponse.json(
        { error: "Assignment ID is required" },
        { status: 400 }
      );
    }
    const assignmentId = Number(idParam);
    if (isNaN(assignmentId)) {
      return NextResponse.json(
        { error: "Invalid Assignment ID" },
        { status: 400 }
      );
    }

    await initDB();
    const repo = AppDataSource.getRepository(Assignment);

    const assignment = await repo.findOneBy({ id: assignmentId });
    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    await repo.delete(assignmentId);
    return NextResponse.json(
      { message: `Assignment ${assignmentId} deleted` },
      { status: 200 }
    );
  } catch (err) {
    return handleError(err);
  }
}

/**
 * Standard error handler for API routes.
 * Logs the error and returns a 500 response.
 *
 * @param error Unknown error object
 * @returns JSON error response with status 500
 */
function handleError(error: unknown): NextResponse {
  console.error("❌", error);
  const msg = error instanceof Error ? error.message : "Unknown error";
  return NextResponse.json({ error: msg }, { status: 500 });
}