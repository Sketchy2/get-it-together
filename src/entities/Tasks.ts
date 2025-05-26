import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Assignment } from "./Assignments";
import { TaskAssignee } from "./TaskAssignee";
import { UserEntity } from "./auth-entities";
import type { Relation } from "typeorm";

// Define a Priority enum for low, medium, high values
export enum Priority {
  Low = "low",
  Medium = "medium",
  High = "high",
}

@Entity("task")
export class Task {
  @PrimaryGeneratedColumn({ name: "task_id" })
  id: number;

  @Column({ name: "title", type: "varchar", length: 255 })
  title: string;

  @Column({ name: "description", type: "text", nullable: true })
  description: string | null;

  @Column({ name: "status", type: "varchar", length: 50 })
  status: "To-Do" | "In Progress" | "Completed";

  // Use enum type for priority
  @Column({
    name: "priority",
    type: "enum",
    enum: Priority,
    default: Priority.Medium,
  })
  priority: Priority;

  @Column({ name: "due_date", type: "timestamp", nullable: true })
  deadline: Date | null;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.id)
  createdByUser!: Relation<UserEntity>;

  @ManyToOne(() => Assignment, (assignment) => assignment.tasks, {
    onDelete: "CASCADE",
  })
  assignment!: Relation<Assignment>;


  @OneToMany(() => TaskAssignee, (taskAssignee) => taskAssignee.task)
  assignees: TaskAssignee[];
}
