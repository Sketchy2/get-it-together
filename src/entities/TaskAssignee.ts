import { Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import type { Relation } from "typeorm";
import { Task } from "./Task";
import { User } from "./User";

@Entity("TASKASSIGNEE")
export class TaskAssignee {
  @PrimaryGeneratedColumn()
  taskassignee_id: number;

  @ManyToOne(() => Task, (task) => task.assignees, { onDelete: "CASCADE" })
  task: Relation<Task>;

  @ManyToOne(() => User, () => User, { onDelete: "CASCADE" })
  user: Relation<User>;
}
