import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from "typeorm";
import { TaskAssignee } from "./TaskAssignee";

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
  dueDate: Date | null;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt: Date;

  @OneToMany(() => TaskAssignee, (taskAssignee) => taskAssignee.task)
  assignees: TaskAssignee[];
}
