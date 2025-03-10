import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import type { Relation } from "typeorm";
import { Account } from "./Account";
import { Session } from "./Session";
import { TaskAssignee } from "./TaskAssignee";

@Entity("APP_USER")
export class User {
  @PrimaryGeneratedColumn({ name: "USER_ID" })
  user_id: number;

  @Column({ name: "NAME", length: 100 })
  name: string;

  @Column({ name: "EMAIL", length: 255, unique: true })
  email: string;

  @Column({ name: "EMAIL_VERIFIED", type: "timestamp", nullable: true })
  email_verified: Date;

  @Column({ name: "IMAGE", length: 500, nullable: true })
  image: string;

  @CreateDateColumn({ name: "CREATED_AT", type: "timestamp" })
  created_at: Date;

  @OneToMany(() => Account, (account) => account.user_id)
  accounts: Relation<Account[]>;

  @OneToMany(() => Session, (session) => session.user)
  sessions: Relation<Session[]>;

  @OneToMany(() => TaskAssignee, (taskAssignee) => taskAssignee.user)
  taskAssignments: Relation<TaskAssignee[]>;
}
