import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import type { Relation } from "typeorm";
import { Task } from "./Task";
import { User } from "./auth-entities";

@Entity("TASKASSIGNEE")
export class TaskAssignee {
  @PrimaryGeneratedColumn({ name: "TASKASSIGNEE_ID" })
  id: number;

  @ManyToOne(() => Task, (task) => task.assignees, { onDelete: "CASCADE" })
  @JoinColumn({ name: "TASK_ID" })
  task: Relation<Task>;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "USER_ID" })
  user: Relation<User>;
}
