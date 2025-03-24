// import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
// // import type { Relation } from "typeorm";
// import { AccountEntity } from "./Account";
// import { SessionEntity } from "./Session";
// // import { TaskAssignee } from "./TaskAssignee";




// // @Entity("APP_USER")
// // export class User {
// //   @PrimaryGeneratedColumn({ name: "USER_ID" })
// //   id: string;

// //   @Column({ name: "NAME", length: 100 })
// //   name: string;

// //   @Column({ name: "EMAIL", length: 255, unique: true })
// //   email: string;

// //   @Column({ type: "varchar", nullable: true, transformer: transformer.date })
// //   emailVerified!: string | null

// //   @Column({ name: "IMAGE", length: 500, nullable: true })
// //   image: string;

// //   @CreateDateColumn({ name: "CREATED_AT", type: "timestamp" })
// //   createdAt: Date;

// //   @OneToMany(() => Account, (account) => account.id)
// //   accounts: Relation<Account[]>;

// //   @OneToMany(() => Session, (session) => session.user)
// //   sessions: Relation<Session[]>;

// //   @OneToMany(() => TaskAssignee, (taskAssignee) => taskAssignee.user)
// //   taskAssignments: Relation<TaskAssignee[]>;
// // }

