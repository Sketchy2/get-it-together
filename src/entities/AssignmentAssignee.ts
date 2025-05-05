import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    Column,
    JoinColumn
  } from "typeorm";

  import type { Relation } from "typeorm";
  
  import { Assignment } from "./Assignments";
  import { UserEntity } from "./auth-entities";
  
  @Entity("assignment_assignees")
  export class AssignmentAssignee {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne(() => Assignment, (assignment) => assignment.assignees)
    assignment!: Relation<Assignment>;
  
    @ManyToOne(() => UserEntity, { onDelete: "CASCADE" })
    user: Relation<UserEntity>;
  }
  