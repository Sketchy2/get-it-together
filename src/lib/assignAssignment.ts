import { DataSource } from "typeorm";
import { Assignment } from "@/entities/Assignments";
import { UserEntity } from "@/entities/auth-entities";
import { AssignmentAssignee } from "@/entities/AssignmentAssignee";
import { Event } from "@/entities/Event";

export async function assignUserToAssignment(
  ds: DataSource,
  assignmentId: number,
  userId: string
) {
  const assignmentRepo = ds.getRepository(Assignment);
  const userRepo = ds.getRepository(UserEntity);
  const assigneeRepo = ds.getRepository(AssignmentAssignee);
  const eventRepo = ds.getRepository(Event);

  const assignment = await assignmentRepo.findOne({
    where: { id: assignmentId },
  });

  const user = await userRepo.findOne({
    where: { id: userId },
  });

  if (!assignment || !user) {
    throw new Error("Assignment or User not found");
  }

  const existingAssignee = await assigneeRepo.findOne({
    where: {
      assignment: { id: assignmentId },
      user: { id: userId },
    },
  });

  if (!existingAssignee) {
    const assignee = assigneeRepo.create({ assignment, user });
    await assigneeRepo.save(assignee);
    
    // 💥 Create an Event for the assignment
    const event = eventRepo.create({
      title: `Assignment Due: ${assignment.title}`,
      start: assignment.deadline || new Date(),
      end: assignment.deadline || new Date(),
      description: assignment.description || "No description provided.",
      eventType: "assignment",
      color: "#E74C3C", // red for assignments
      assignment: assignment,
      assignmentId: assignment.id,
      user: user,
      userId: user.id,
    });

    await eventRepo.save(event);
  }
}
