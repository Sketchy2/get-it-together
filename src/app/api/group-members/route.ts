/**
 * API Routes for GroupMember entity operations.
 * Handles adding/removing users from groups.
 */

import { NextRequest, NextResponse } from "next/server";
import { AppDataSource } from "@/auth";
import { GroupMember } from "@/entities/Groups";

/** Initialize DB if not already */
async function initDB(): Promise<void> {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    console.log("Database initialized");
  }
}

/**
 * POST /api/group-members
 * Adds a user to a group with a role.
 *
 * Expects JSON body:
 * - groupId: number (required)
 * - userId: string (UUID, required)
 * - role: string (required)
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await initDB();
    const { groupId, userId, role } = await req.json();

    if (!groupId || !userId || !role) {
      return NextResponse.json(
        { error: "groupId, userId and role are required" },
        { status: 400 }
      );
    }

    const repo = AppDataSource.getRepository(GroupMember);
    const newMember = repo.create({ group: { id: groupId }, user: { id: userId }, role });
    const saved = await repo.save(newMember);
    return NextResponse.json(saved, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}

/**
 * DELETE /api/group-members?id={memberId}
 * Removes a group member by their group_member_id
 */
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(req.url);
    const idParam = url.searchParams.get("id");
    if (!idParam || isNaN(Number(idParam))) {
      return NextResponse.json(
        { error: "Valid member ID is required" },
        { status: 400 }
      );
    }
    const memberId = Number(idParam);

    await initDB();
    const repo = AppDataSource.getRepository(GroupMember);
    const member = await repo.findOneBy({ id: memberId });
    if (!member) {
      return NextResponse.json(
        { error: "Group member not found" },
        { status: 404 }
      );
    }

    await repo.delete(memberId);
    return NextResponse.json(
      { message: `Member ${memberId} removed` },
      { status: 200 }
    );
  } catch (err) {
    return handleError(err);
  }
}

/**
 * GET /api/group-members?groupId={id}
 * Returns all members for a given group ID
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(req.url);
    const groupIdParam = url.searchParams.get("groupId");
    if (!groupIdParam || isNaN(Number(groupIdParam))) {
      return NextResponse.json(
        { error: "Valid groupId is required" },
        { status: 400 }
      );
    }
    const groupId = Number(groupIdParam);

    await initDB();
    const repo = AppDataSource.getRepository(GroupMember);
    const members = await repo.find({
      where: { group: { id: groupId } },
      relations: ["user"],
    });
    return NextResponse.json(members);
  } catch (err) {
    return handleError(err);
  }
}

function handleError(error: unknown): NextResponse {
  console.error("❌", error);
  const msg = error instanceof Error ? error.message : "Unknown error";
  return NextResponse.json({ error: msg }, { status: 500 });
}