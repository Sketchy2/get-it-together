import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import type { Relation } from "typeorm";
import { User } from "./User";

@Entity("USER_SESSION")
export class Session {
  @PrimaryGeneratedColumn({ name: "SESSION_ID" })
  session_id: number;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "USER_ID" })
  user: Relation<User>;

  @Column({ name: "SESSION_TOKEN", length: 255, unique: true })
  session_token: string;

  @Column({ name: "EXPIRES", type: "timestamp" })
  expires: Date;
}
