import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import { TaskAssignee } from "./TaskAssignee";

@Entity("TASK")
export class Task {
  @PrimaryGeneratedColumn({ name: "TASK_ID" })
  task_id: number;

  @Column({ name: "TITLE", length: 255 })
  title: string;

  @Column({ name: "DESCRIPTION", type: "clob", nullable: true })
  description: string;

  @Column({ name: "STATUS", length: 50 })
  status: "To-Do" | "In Progress" | "Completed";

  @Column({ name: "PRIORITY", type: "int", nullable: true })
  priority: number;

  @Column({ name: "DUE_DATE", type: "date", nullable: true })
  due_date: Date | null;

  @CreateDateColumn({ name: "CREATED_AT", type: "timestamp" })
  created_at: Date;

  @OneToMany(() => TaskAssignee, (taskAssignee) => taskAssignee.task)
  assignees: TaskAssignee[];
}
