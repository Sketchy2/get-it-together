import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import type { Relation } from "typeorm";
import { User } from "./User";

@Entity("ACCOUNT")
export class Account {
  @PrimaryGeneratedColumn({ name: "ACCOUNT_ID" })
  id: string;


  @Column({ type: "uuid" })
  userId!: string

  @ManyToOne(() => User, (user) => user.accounts, { onDelete: "CASCADE" })
  @JoinColumn({ name: "USER" })
  user: Relation<User>;

  @Column({ name: "TYPE", length: 50 })
  type: string;

  @Column({ name: "PROVIDER", length: 255 })
  provider: string;

  @Column({ name: "PROVIDER_ACCOUNT_ID", length: 255, unique: true })
  providerAccountId: string;

  @Column({ name: "REFRESH_TOKEN", length: 255, nullable: true })
  refresh_token: string;

  @Column({ name: "ACCESS_TOKEN", length: 255, nullable: true })
  access_token: string;

  @Column({ name: "EXPIRES_AT", type: "int", nullable: true })
  expires_at: number;

  @Column({ name: "TOKEN_TYPE", length: 50, nullable: true })
  token_type: string;

  @Column({ name: "SCOPE", length: 255, nullable: true })
  scope: string;

  @Column({ name: "ID_TOKEN", length: 500, nullable: true })
  id_token: string;

  @Column({ name: "SESSION_STATE", length: 255, nullable: true })
  session_state: string;
}
