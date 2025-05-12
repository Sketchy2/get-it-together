import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { DataSource } from "typeorm";
import { typeormOptions } from "@/typeorm-datasource";
import { Event } from "@/entities/Event";
import { Assignment } from "@/entities/Assignments";
import { UserEntity } from "@/entities/auth-entities";

/** Helper: create a fresh connection */
async function getDataSource() {
  const dataSource = new DataSource(typeormOptions);
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }
  return dataSource;
}

/** GET /api/events?userId=... */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const repo = dataSource.getRepository(Event);

    const events = await repo.find({
      where: { userId },
      relations: ["assignment"],
    });

    await dataSource.destroy();
    return NextResponse.json(events);
  } catch (err) {
    console.error("GET /api/events error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/** POST /api/events */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, start, end, description, location, color, eventType, assignmentId } = await req.json();

    if (!title || !start || !end) {
      return NextResponse.json({ error: "Title, start, and end are required" }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const repo = dataSource.getRepository(Event);
    const userRepo = dataSource.getRepository(UserEntity);
    const assignmentRepo = dataSource.getRepository(Assignment);

    const user = await userRepo.findOneBy({ id: session.user.id });
    if (!user) {
      await dataSource.destroy();
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let assignment: Assignment | null = null;
    if (assignmentId) {
      assignment = await assignmentRepo.findOneBy({ id: assignmentId });
      if (!assignment) {
        await dataSource.destroy();
        return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
      }
    }

    const event = repo.create({
      title,
      start: new Date(start),
      end: new Date(end),
      description: description || null,
      location: location || null,
      color: color || null,
      eventType: eventType || null,
      user,
      userId: user.id,
      assignment: assignment ?? undefined,
    });
    

    const saved = await repo.save(event);
    await dataSource.destroy();
    return NextResponse.json(saved, { status: 201 });
  } catch (err) {
    console.error("POST /api/events error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/** PUT /api/events */
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, title, start, end, description, location, color, eventType, assignmentId } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Event id is required" }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const repo = dataSource.getRepository(Event);
    const assignmentRepo = dataSource.getRepository(Assignment);

    const event = await repo.findOne({ where: { id }, relations: ["assignment"] });
    if (!event) {
      await dataSource.destroy();
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    event.title = title ?? event.title;
    event.start = start ? new Date(start) : event.start;
    event.end = end ? new Date(end) : event.end;
    event.description = description ?? event.description;
    event.location = location ?? event.location;
    event.color = color ?? event.color;
    event.eventType = eventType ?? event.eventType;

    if (assignmentId !== undefined) {
      if (assignmentId) {
        const assignment = await assignmentRepo.findOneBy({ id: assignmentId });
        if (!assignment) {
          await dataSource.destroy();
          return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
        }
        event.assignment = assignment;
        event.assignmentId = assignment.id;
      } else {
        event.assignment = undefined;
        event.assignmentId = undefined;
      }
    }

    const updated = await repo.save(event);
    await dataSource.destroy();
    return NextResponse.json(updated);
  } catch (err) {
    console.error("PUT /api/events error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/** DELETE /api/events?id=... */
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Event id is required" }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const repo = dataSource.getRepository(Event);

    const event = await repo.findOneBy({ id });
    if (!event) {
      await dataSource.destroy();
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    await repo.remove(event);
    await dataSource.destroy();
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("DELETE /api/events error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
