// entity/Event.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm"
import { Assignment } from "./Assignments"
import { UserEntity } from "./auth-entities"

@Entity()
export class Event {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  title: string

  @Column({ type: "timestamp" })
  start: Date

  @Column({ type: "timestamp" })
  end: Date

  @Column({ nullable: true })
  description?: string

  @Column({ nullable: true })
  location?: string

  @Column({ nullable: true })
  color?: string

  @Column({ nullable: true })
  eventType?: "assignment" | "meeting" | "task" | "presentation" | "other"

  @ManyToOne(() => UserEntity, { eager: true, nullable: false })
  @JoinColumn({ name: "userId" })
  user: UserEntity

  @Column({ nullable: true })
  userId: string

  @ManyToOne(() => Assignment, {
    nullable: true,
    onDelete: "CASCADE"
  })
  @JoinColumn({ name: "assignmentId" })
  assignment?: Assignment

  @Column({ nullable: true })
  assignmentId?: Number
}
