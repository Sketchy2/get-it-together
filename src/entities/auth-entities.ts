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
      from: (date: string | null) => (date ? new Date(date) : null), // Convert string → Date
      to: (date?: Date) => (date ? date.toISOString() : null),       // Convert Date → string (ISO format)
    },
    bigint: {
      from: (bigInt: number | null) => bigInt,
      to: (bigInt?: number) => bigInt ?? null,
    },
  };
  
  
  @Entity({ name: "users" })
  export class User {
    @PrimaryGeneratedColumn("uuid")
    id!: string
  
    @Column({ type: "varchar2", length: 255, nullable: true })
    name!: string | null
  
    @Column({ type: "varchar2", length: 255, nullable: true, unique: true })
    email!: string | null
  
    @Column({ type: "varchar2", length: 255, nullable: true, transformer: transformer.date })
    emailVerified!: string | null;
    
  
    @Column({ type: "varchar2", length: 500, nullable: true })
    image!: string | null
  
    @Column({ type: "varchar2", length: 50, nullable: true })
    role!: string | null
  
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
  
    @Column({ type: "date", transformer: transformer.date })
    expires!: Date
  }
  