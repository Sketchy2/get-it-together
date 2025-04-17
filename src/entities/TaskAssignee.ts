import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import type { Relation } from "typeorm";
import { Task } from "./Tasks";
import { User } from "./auth-entities";

@Entity("task_assignee")
export class TaskAssignee {
  @PrimaryGeneratedColumn({ name: "task_assignee_id" })
  id: number;

  @ManyToOne(() => Task, (task) => task.assignees, { onDelete: "CASCADE" })
  @JoinColumn({ name: "task_id" })
  task: Relation<Task>;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: Relation<User>;
}
