import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Assignment } from "./Assignments"; // 🔥 important
import { TaskAssignee } from "./TaskAssignee";
import { UserEntity } from "./auth-entities";
import type { Relation } from "typeorm";

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

  @Column({ name: "priority", type: "int", nullable: true })
  priority: number | null;

  @Column({ name: "due_date", type: "timestamp", nullable: true })
  deadline: Date | null;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.id)
  createdByUser!: Relation<UserEntity>;

  @ManyToOne(() => Assignment, (assignment) => assignment.tasks)
  assignment!: Relation<Assignment>;

  @OneToMany(() => TaskAssignee, (taskAssignee) => taskAssignee.task)
  assignees: TaskAssignee[];
}
