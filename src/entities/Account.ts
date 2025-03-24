// import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ValueTransformer } from "typeorm";
// // import type { Relation } from "typeorm";
// import { UserEntity } from "./User";

// const transformer: Record<"date" | "bigint", ValueTransformer> = {
//   date: {
//     from: (date: string | null) => date && new Date(parseInt(date, 10)),
//     to: (date?: Date) => date?.valueOf().toString(),
//   },
//   bigint: {
//     from: (bigInt: string | null) => bigInt && parseInt(bigInt, 10),
//     to: (bigInt?: number) => bigInt?.toString(),
//   },
// }


//   @Entity({ name: "accounts" })
//   export class AccountEntity {
//     @PrimaryGeneratedColumn("uuid") // Use VARCHAR2(36)
//     id!: string;
  
//     @Column({ type: "varchar2", length: 36 })
//     userId!: string;
  
//     @Column({ type: "varchar2", length: 50 })
//     type!: string;
  
//     @Column({ type: "varchar2", length: 100 })
//     provider!: string;
  
//     @Column({ type: "varchar2", length: 100 })
//     providerAccountId!: string;
  
//     @Column({ type: "varchar2", length: 512, nullable: true })
//     refresh_token!: string | null;
  
//     @Column({ type: "varchar2", length: 512, nullable: true })
//     access_token!: string | null;
  
//     @Column({ type: "number", nullable: true, transformer: transformer.bigint })
//     expires_at!: number | null;
  
//     @Column({ type: "varchar2", length: 50, nullable: true })
//     token_type!: string | null;
  
//     @Column({ type: "varchar2", length: 512, nullable: true })
//     scope!: string | null;
  
//     @Column({ type: "varchar2", length: 2048, nullable: true })
//     id_token!: string | null;
  
//     @Column({ type: "varchar2", length: 255, nullable: true })
//     session_state!: string | null;
  
//     @Column({ type: "varchar2", length: 512, nullable: true })
//     oauth_token_secret!: string | null;
  
//     @Column({ type: "varchar2", length: 512, nullable: true })
//     oauth_token!: string | null;
  
//     @ManyToOne(() => UserEntity, (user) => user.accounts, {
//       createForeignKeyConstraints: true,
//     })
//     user!: UserEntity;
//   }


// // @Entity("ACCOUNT")
// // export class Account {
// //   @PrimaryGeneratedColumn({ name: "ACCOUNT_ID" })
// //   id: string;


// //   @Column({ type: "uuid" })
// //   userId!: string

// //   @ManyToOne(() => User, (user) => user.accounts, { onDelete: "CASCADE" })
// //   @JoinColumn({ name: "USER" })
// //   user: Relation<User>;

// //   @Column({ name: "TYPE", length: 50 })
// //   type: string;

// //   @Column({ name: "PROVIDER", length: 255 })
// //   provider: string;

// //   @Column({ name: "PROVIDER_ACCOUNT_ID", length: 255, unique: true })
// //   providerAccountId: string;

// //   @Column({ name: "REFRESH_TOKEN", length: 255, nullable: true })
// //   refresh_token: string;

// //   @Column({ name: "ACCESS_TOKEN", length: 255, nullable: true })
// //   access_token: string;

// //   @Column({ name: "EXPIRES_AT", type: "int", nullable: true })
// //   expires_at: number;

// //   @Column({ name: "TOKEN_TYPE", length: 50, nullable: true })
// //   token_type: string;

// //   @Column({ name: "SCOPE", length: 255, nullable: true })
// //   scope: string;

// //   @Column({ name: "ID_TOKEN", length: 500, nullable: true })
// //   id_token: string;

// //   @Column({ name: "SESSION_STATE", length: 255, nullable: true })
// //   session_state: string;
// // }
