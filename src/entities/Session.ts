// import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
// // import type { Relation } from "typeorm";
// import { UserEntity } from "./User";



// @Entity("USER_SESSION")
// export class Session {
//   @PrimaryGeneratedColumn({ name: "SESSION_ID" })
//   id: string;

//   @Column({ type: "uuid" })
//   userId!: string

//   @ManyToOne(() => User, { onDelete: "CASCADE" })
//   @JoinColumn({ name: "USER_ID" })
//   user: Relation<User>;

//   @Column({ name: "SESSION_TOKEN", length: 255, unique: true })
//   sessionToken: string;

//   @Column({ name: "EXPIRES", type: "timestamp" })
//   expires: string;
// }
