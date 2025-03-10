import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import type { Relation } from "typeorm";
import { User } from "./User";

@Entity("ACCOUNT")
export class Account {
  @PrimaryGeneratedColumn()
  account_id: number;

  @ManyToOne(() => User, (user) => user.accounts, { onDelete: "CASCADE" })
  user: Relation<User>;  // ✅ Fixed

  @Column({ length: 50 })
  type: string;

  @Column({ length: 255 })
  provider: string;

  @Column({ length: 255, unique: true })
  provider_account_id: string;

  @Column({ length: 255, nullable: true })
  refresh_token: string;

  @Column({ length: 255, nullable: true })
  access_token: string;

  @Column({ type: "int", nullable: true })
  expires_at: number;

  @Column({ length: 50, nullable: true })
  token_type: string;

  @Column({ length: 255, nullable: true })
  scope: string;

  @Column({ length: 500, nullable: true })
  id_token: string;

  @Column({ length: 255, nullable: true })
  session_state: string;
}
