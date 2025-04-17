import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany
  } from "typeorm"
  

  @Entity({ name: "users" })
  export class User {
    @PrimaryGeneratedColumn("uuid")
    id!: string
  
    @Column({ type: "varchar", length: 255, nullable: true })
    name!: string | null
  
    @Column({ type: "varchar", length: 255, nullable: true, unique: true })
    email!: string | null
  
    @Column({ 
      type: "varchar", 
      nullable: true,
      transformer: {
        to: (value: Date | null): string | null => (value ? value.toISOString() : null),
        from: (value: string | null): Date | null => (value ? new Date(value) : null)
      }
    })
    emailVerified!: Date | null;
    
    @Column({ type: "varchar", length: 500, nullable: true })
    image!: string | null
  
    @OneToMany(() => Session, (session) => session.userId)
    sessions!: Session[]
  
    @OneToMany(() => Account, (account) => account.user)
    accounts!: Account[]
  }
  
  @Entity({ name: "accounts" })
  export class Account {
    @PrimaryGeneratedColumn("uuid")
    id!: string
  
    @Column({ type: "varchar", length: 255 })
    type!: string
  
    @Column({ type: "varchar", length: 255 })
    provider!: string
  
    @Column({ type: "varchar", length: 255 })
    providerAccountId!: string
  
    @Column({ type: "varchar", length: 500, nullable: true })
    refresh_token!: string | null
  
    @Column({ type: "varchar", length: 500, nullable: true })
    access_token!: string | null
  
    @Column({ type: "int", nullable: true})
    expires_at!: number | null
  
    @Column({ type: "varchar", length: 255, nullable: true })
    token_type!: string | null
  
    @Column({ type: "varchar", length: 500, nullable: true })
    scope!: string | null
  
    @Column({ type: "text", nullable: true })
    id_token!: string | null
  
    @Column({ type: "varchar", length: 255, nullable: true })
    session_state!: string | null
  
    @Column({ type: "varchar", length: 500, nullable: true })
    oauth_token_secret!: string | null
  
    @Column({ type: "varchar", length: 500, nullable: true })
    oauth_token!: string | null
  
    @ManyToOne(() => User, (user) => user.accounts)
    user!: User
  }
  
  @Entity({ name: "sessions" })
  export class Session {
    @PrimaryGeneratedColumn("uuid")
    id!: string
  
    @Column({ type: "varchar", length: 255, unique: true })
    sessionToken!: string
  
    @Column({ type: "timestamp"})
    expires!: Date
  
    @ManyToOne(() => User, (user) => user.sessions)
    userId!: User
  }
  
  @Entity({ name: "verification_tokens" })
  export class VerificationToken {
    @PrimaryGeneratedColumn("uuid")
    id!: string
  
    @Column({ type: "varchar", length: 255 })
    token!: string
  
    @Column({ type: "varchar", length: 255 })
    identifier!: string
  
    @Column({ type: "timestamp" })
    expires!: Date    
  }
  