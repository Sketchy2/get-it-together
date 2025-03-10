import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import type { Relation } from "typeorm";
import { Account } from "./Account";
import { Session } from "./Session";
import { TaskAssignee } from "./TaskAssignee";

@Entity("APP_USER")
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ type: "timestamp", nullable: true })
  email_verified: Date;

  @Column({ length: 500, nullable: true })
  image: string;

  @CreateDateColumn({ type: "timestamp" })
  created_at: Date;

  @OneToMany(() => Account, (account) => account.user)
  accounts: Relation<Account[]>;

  @OneToMany(() => Session, (session) => session.user)
  sessions: Relation<Session[]>;

  @OneToMany(() => TaskAssignee, (taskAssignee) => taskAssignee.user)
  taskAssignments: Relation<TaskAssignee[]>;
}
