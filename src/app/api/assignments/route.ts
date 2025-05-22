import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { DataSource } from "typeorm";
import { typeormOptions } from "@/typeorm-datasource";
import { Assignment } from "@/entities/Assignments";
import { UserEntity } from "@/entities/auth-entities";
import { AssignmentAssignee } from "@/entities/AssignmentAssignee";
import { assignUserToAssignment } from "@/lib/assignAssignment";

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
 * GET /api/assignments
 * Fetch all assignments (with assignees and tasks)
 */
// export async function GET() {
//   const session = await auth();
//   const email = session?.user?.email;
//   if (!email) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const ds = await getDataSource();
//   try {
//     const assignments = await ds
//       .getRepository(Assignment)
//       .createQueryBuilder("assignment")
//       // join in your assignees
//       .leftJoinAndSelect("assignment.assignees", "assignee")
//       // join the user on each assignee
//       .leftJoinAndSelect("assignee.user", "user")
//       // join any other relations you need
//       .leftJoinAndSelect("assignment.tasks", "task")
//       // filter by the logged-in user’s email
//       .where("user.email = :email", { email })
//       .getMany();

//     return NextResponse.json(assignments);
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   } finally {
//     await ds.destroy();
//   }
// }

// src/app/api/assignments/route.ts

export async function GET(req: NextRequest) {
  const session = await auth();
  const email   = session?.user?.email;
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ds = await getDataSource();
  try {
    // 1) Build your query: filter down to assignments this user is on,
    //    then load *all* assignees (and their users), tasks, files & links.
    const qb = ds.getRepository(Assignment).createQueryBuilder("assignment");
    qb.innerJoin(
      "assignment.assignees",
      "filterAssignee"
    ).innerJoin(
      "filterAssignee.user",
      "filterUser",
      "filterUser.email = :email",
      { email }
    );
    qb.leftJoinAndSelect("assignment.assignees", "assignee")
      .leftJoinAndSelect("assignee.user",        "user")
      .leftJoinAndSelect("assignment.tasks",     "task")

    const raw = await qb.getMany();

    // 2) Map it into exactly the shape your front-end `Assignment` type expects:
    const formatted = raw.map((a) => ({
      id:          a.id.toString(),
      title:       a.title,
      description: a.description ?? "",
      deadline:    a.deadline    ? a.deadline.toISOString()    : "",
      weighting:   a.weighting   ?? 0,
      status:      a.status,
      progress:    a.progress,
      finalGrade:  a.finalGrade  ?? null,

      // pull out just the raw User objects
      members: a.assignees.map((asst) => ({
        id:    asst.user.id,
        name:  asst.user.name,
        email: asst.user.email ?? "",
      })),

      tasks: a.tasks.map((t) => ({
        id:           t.id.toString(),
        title:        t.title,
        description:  t.description ?? "",
        dueDate:      t.deadline   ? t.deadline.toISOString()   : "",
        status:       t.status,
        priority:     t.priority,
        createdAt:    t.createdAt.toISOString(),
        assignmentId: a.id.toString(),
      })),
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    await ds.destroy();
  }
}


export async function POST(req: NextRequest) {
  const session = await auth();
  const userid = session?.user?.id;
  if (!userid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description, weighting, deadline, progress, status, finalGrade, members } = await req.json();

  if (!title || !status) {
    return NextResponse.json({ error: "Title and Status are required" }, { status: 400 });
  }

  const ds = await getDataSource();
  try {
    const assignmentRepo = ds.getRepository(Assignment);
    const userRepo = ds.getRepository(UserEntity);

    // Find the userEntity by userid
    const userEntity = await userRepo.findOne({ where: { id: userid } });

    if (!userEntity) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    // Create & save the assignment
    const assignment = assignmentRepo.create({
      title,
      description:   description   ?? null,
      weighting:     weighting     ?? null,
      deadline:      deadline      ? new Date(deadline) : null,
      progress:      progress      ?? 0,
      status,
      finalGrade:    finalGrade    ?? null,
      createdByUser: userEntity,
    });

    const saved = await assignmentRepo.save(assignment);

    // Use shared function to assign the creator
    await assignUserToAssignment(ds, saved.id, userEntity.id);

    // Assign all other members
    console.log("Members to assign:", members);
    if (Array.isArray(members)) {
      const userRepo = ds.getRepository(UserEntity)
      for (const email of members) {
        console.log("Assigning member:", email);
        const member = await userRepo.findOne({ where: { email } });
        console.log("Found member:", member);
        if (member) {
          await assignUserToAssignment(ds, saved.id, member.id);
        }
      }
    }
    
    return NextResponse.json(saved, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    await ds.destroy();
  }
}