import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import type { Relation } from "typeorm";
import { User } from "./User";

@Entity("USER_SESSION")
export class Session {
  @PrimaryGeneratedColumn()
  session_id: number;

  @ManyToOne(() => User, () => User, { onDelete: "CASCADE" })
  user: Relation<User>;

  @Column({ length: 255, unique: true })
  session_token: string;

  @Column({ type: "timestamp" })
  expires: Date;
}
