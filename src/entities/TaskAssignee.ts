import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import type { Relation } from "typeorm";
import { Task } from "./Tasks";
import { UserEntity } from "./auth-entities";

@Entity("task_assignee")
export class TaskAssignee {
  @PrimaryGeneratedColumn({ name: "task_assignee_id" })
  id: number;

  @ManyToOne(() => Task, (task) => task.assignees, { onDelete: "CASCADE" })
  task: Relation<Task>;

  
  @ManyToOne(() => UserEntity, (UserEntity) => UserEntity.taskAssignees, { onDelete: "CASCADE" })
  user: Relation<UserEntity>;
}
