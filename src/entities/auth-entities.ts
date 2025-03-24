import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    ValueTransformer,
  } from "typeorm"
  
  // Custom Transformers for Oracle
  const transformer: Record<"date" | "bigint", ValueTransformer> = {
    date: {
        from: (date: string | null) => date && new Date(parseInt(date, 10)),
        to: (date?: Date) => date?.valueOf().toString(),
      },
      bigint: {
        from: (bigInt: string | null) => (bigInt ? parseInt(bigInt, 10) : null),
        to: (bigInt?: number) => (bigInt ? bigInt.toString() : null),
      },
  };
  
//   const transformer: Record<"bigint", ValueTransformer> = {
//     bigint: {
//       from: (bigInt: string | null) => (bigInt ? parseInt(bigInt, 10) : null),
//       to: (bigInt?: number) => (bigInt ? bigInt.toString() : null),
//     },

// };
  

  @Entity({ name: "users" })
  export class User {
    @PrimaryGeneratedColumn("uuid")
    id!: string
  
    @Column({ type: "varchar2", length: 255, nullable: true })
    name!: string | null
  
    @Column({ type: "varchar2", length: 255, nullable: true, unique: true })
    email!: string | null
  
    @Column({ type: "date", nullable: true })
    emailVerified!: Date | null;
    
  
    @Column({ type: "varchar2", length: 500, nullable: true })
    image!: string | null
  
  
    @OneToMany(() => Session, (session) => session.user)
    sessions!: Session[]
  
    @OneToMany(() => Account, (account) => account.user)
    accounts!: Account[]
  }
  
  @Entity({ name: "accounts" })
  export class Account {
    @PrimaryGeneratedColumn("uuid")
    id!: string
  
    @Column({ type: "varchar2", length: 36 })
    userId!: string
  
    @Column({ type: "varchar2", length: 255 })
    type!: string
  
    @Column({ type: "varchar2", length: 255 })
    provider!: string
  
    @Column({ type: "varchar2", length: 255 })
    providerAccountId!: string
  
    @Column({ type: "varchar2", length: 500, nullable: true })
    refresh_token!: string | null
  
    @Column({ type: "varchar2", length: 500, nullable: true })
    access_token!: string | null
  
    @Column({ type: "number", nullable: true, transformer: transformer.bigint })
    expires_at!: number | null
  
    @Column({ type: "varchar2", length: 255, nullable: true })
    token_type!: string | null
  
    @Column({ type: "varchar2", length: 500, nullable: true })
    scope!: string | null
  
    @Column({ type: "clob", nullable: true }) // Allows storing larger tokens
    id_token!: string | null
    
  
    @Column({ type: "varchar2", length: 255, nullable: true })
    session_state!: string | null
  
    @Column({ type: "varchar2", length: 500, nullable: true })
    oauth_token_secret!: string | null
  
    @Column({ type: "varchar2", length: 500, nullable: true })
    oauth_token!: string | null
  
    @ManyToOne(() => User, (user) => user.accounts)
    user!: User
  }
  
  @Entity({ name: "sessions" })
  export class Session {
    @PrimaryGeneratedColumn("uuid")
    id!: string
  
    @Column({ type: "varchar2", length: 255, unique: true })
    sessionToken!: string
  
    @Column({ type: "varchar2", length: 36 })
    userId!: string
  
    @Column({ type: "date", transformer: transformer.date })
    expires!: Date
  
    @ManyToOne(() => User, (user) => user.sessions)
    user!: User
  }
  
  @Entity({ name: "verification_tokens" })
  export class VerificationToken {
    @PrimaryGeneratedColumn("uuid")
    id!: string
  
    @Column({ type: "varchar2", length: 255 })
    token!: string
  
    @Column({ type: "varchar2", length: 255 })
    identifier!: string
  
    @Column({ type: "timestamp" })
    expires!: string    
  }
  