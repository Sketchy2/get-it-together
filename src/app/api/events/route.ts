import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { DataSource } from "typeorm";
import { typeormOptions } from "@/typeorm-datasource";
import { Event } from "@/entities/Event";
import { Assignment } from "@/entities/Assignments";

/** Helper: create a fresh connection */
async function getDataSource() {
  const dataSource = new DataSource(typeormOptions);
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }
  return dataSource;
}

/** GET /api/events */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const dataSource = await getDataSource();
    const repo = dataSource.getRepository(Event);
    const events = await repo.find({ relations: ["assignment"] });
    await dataSource.destroy();
    return NextResponse.json(events);
  } catch (err) {
    console.error(err);
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
    let assignment = null;
    if (assignmentId) {
      const assignmentRepo = dataSource.getRepository(Assignment);
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
      assignment,
    });
    const saved = await repo.save(event);
    await dataSource.destroy();
    return NextResponse.json(saved, { status: 201 });
  } catch (err) {
    console.error(err);
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
    const event = await repo.findOne({ where: { id }, relations: ["assignment"] });
    if (!event) {
      await dataSource.destroy();
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    if (title !== undefined) event.title = title;
    if (start) event.start = new Date(start);
    if (end) event.end = new Date(end);
    if (description !== undefined) event.description = description;
    if (location !== undefined) event.location = location;
    if (color !== undefined) event.color = color;
    if (eventType !== undefined) event.eventType = eventType;
    if (assignmentId !== undefined) {
      if (assignmentId) {
        const assignmentRepo = dataSource.getRepository(Assignment);
        const assignment = await assignmentRepo.findOneBy({ id: assignmentId });
        if (!assignment) {
          await dataSource.destroy();
          return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
        }
        event.assignment = assignment;
      } else {
        event.assignment = null;
        event.assignmentId = null;
      }
    }
    const updated = await repo.save(event);
    await dataSource.destroy();
    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
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
    return NextResponse.json({}, { status: 204 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
