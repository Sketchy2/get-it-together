import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn
  } from "typeorm";
  import type { Relation } from "typeorm";
  
  import { User } from "./auth-entities";
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
  
    @ManyToOne(() => User, (user) => user.assignments)
    @JoinColumn({ name: "assignment_created_by" })
    createdByUser!: Relation<User>;
  }
  