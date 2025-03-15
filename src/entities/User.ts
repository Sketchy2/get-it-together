import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany,  ValueTransformer } from "typeorm";
import type { Relation } from "typeorm";
import { Account } from "./Account";
import { Session } from "./Session";
import { TaskAssignee } from "./TaskAssignee";


const transformer: Record<"date" | "bigint", ValueTransformer> = {
  date: {
    from: (date: string | null) => date && new Date(parseInt(date, 10)),
    to: (date?: Date) => date?.valueOf().toString(),
  },
  bigint: {
    from: (bigInt: string | null) => bigInt && parseInt(bigInt, 10),
    to: (bigInt?: number) => bigInt?.toString(),
  },
}

@Entity("APP_USER")
export class User {
  @PrimaryGeneratedColumn({ name: "USER_ID" })
  id: string;

  @Column({ name: "NAME", length: 100 })
  name: string;

  @Column({ name: "EMAIL", length: 255, unique: true })
  email: string;

  @Column({ type: "varchar", nullable: true, transformer: transformer.date })
  emailVerified!: string | null

  @Column({ name: "IMAGE", length: 500, nullable: true })
  image: string;

  @CreateDateColumn({ name: "CREATED_AT", type: "timestamp" })
  createdAt: Date;

  @OneToMany(() => Account, (account) => account.id)
  accounts: Relation<Account[]>;

  @OneToMany(() => Session, (session) => session.user)
  sessions: Relation<Session[]>;

  @OneToMany(() => TaskAssignee, (taskAssignee) => taskAssignee.user)
  taskAssignments: Relation<TaskAssignee[]>;
}
