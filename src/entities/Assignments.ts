import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    OneToMany
  } from "typeorm";
  import type { Relation } from "typeorm";
  
  import { UserEntity } from "./auth-entities";
  import { AssignmentAssignee } from "./AssignmentAssignee";
  import { Task } from "./Tasks";
  /**
   * Represents a coursework assignment within a group.
   */
  @Entity("assignment")
  export class Assignment {
    /** Primary key */
    @PrimaryGeneratedColumn({ name: "assignment_id" })
    id: number;
  
    /** Title of the assignment */
    @Column({ name: "assignment_title", type: "varchar", length: 255 })
    title: string;
  
    /** Full description/details */
    @Column({ name: "assignment_description", type: "text", nullable: true })
    description: string | null;
  
    /** Weighting (e.g., 20 for 20%) */
    @Column({ name: "assignment_weighting", type: "float", nullable: true })
    weighting: number | null;
  
    /** Deadline date/time */
    @Column({ name: "assignment_deadline", type: "timestamp", nullable: true })
    deadline: Date | null;
  
    /** Progress (0–100%) */
    @Column({ name: "assignment_progress", type: "float", default: 0 })
    progress: number;
  
    /** Current status */
    @Column({ name: "assignment_status", type: "varchar", length: 50 })
    status: string;
  
    /** Final grade awarded */
    @Column({ name: "assignment_final_grade", type: "float", nullable: true })
    finalGrade: number | null;
  
    @OneToMany(() => Task, (task) => task.assignment)
    tasks!: Relation<Task[]>;

    @ManyToOne(() => UserEntity, (UserEntity) => UserEntity.id)
    createdByUser!: Relation<UserEntity>;

    @OneToMany(() => AssignmentAssignee, (assignee) => assignee.assignment)
    assignees!: Relation<AssignmentAssignee[]>;
    
  }
  