import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import { TaskAssignee } from "./TaskAssignee";

@Entity("TASK")
export class Task {
  @PrimaryGeneratedColumn()
  task_id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ type: "clob", nullable: true })
  description: string;

  @Column({ length: 50 })
  status: "To-Do" | "In Progress" | "Completed";

  @Column({ type: "int", nullable: true })
  priority: number;

  @Column({ type: "date", nullable: true })
  due_date: Date;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @OneToMany(() => TaskAssignee, (taskAssignee) => taskAssignee.task)
  assignees: TaskAssignee[];
}
