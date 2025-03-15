import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    ValueTransformer,
  } from "typeorm";
  
  const transformer: Record<"bigint", ValueTransformer> = {
    bigint: {
      from: (bigInt: string | null) => (bigInt ? parseInt(bigInt, 10) : null),
      to: (bigInt?: number) => (bigInt ? bigInt.toString() : null),
    },
  };
  
  @Entity({ name: "users" })
  export class UserEntity {
    @PrimaryGeneratedColumn("uuid") // Use VARCHAR2(36) in Oracle
    id!: string;
  
    @Column({ type: "varchar2", length: 255, nullable: true })
    name!: string | null;
  
    @Column({ type: "varchar2", length: 255, nullable: true, unique: true })
    email!: string | null;
  
    @Column({ type: "timestamp", nullable: true }) // Oracle supports TIMESTAMP
    emailVerified!: string | null;
  
    @Column({ type: "varchar2", length: 255, nullable: true })
    image!: string | null;
  
    @Column({ type: "varchar2", length: 50, nullable: true })
    role!: string | null;
  
    @OneToMany(() => SessionEntity, (session) => session.user)
    sessions!: SessionEntity[];
  
    @OneToMany(() => AccountEntity, (account) => account.user)
    accounts!: AccountEntity[];
  }
  
  @Entity({ name: "accounts" })
  export class AccountEntity {
    @PrimaryGeneratedColumn("uuid") // Use VARCHAR2(36)
    id!: string;
  
    @Column({ type: "varchar2", length: 36 })
    userId!: string;
  
    @Column({ type: "varchar2", length: 50 })
    type!: string;
  
    @Column({ type: "varchar2", length: 100 })
    provider!: string;
  
    @Column({ type: "varchar2", length: 100 })
    providerAccountId!: string;
  
    @Column({ type: "varchar2", length: 512, nullable: true })
    refresh_token!: string | null;
  
    @Column({ type: "varchar2", length: 512, nullable: true })
    access_token!: string | null;
  
    @Column({ type: "number", nullable: true, transformer: transformer.bigint })
    expires_at!: number | null;
  
    @Column({ type: "varchar2", length: 50, nullable: true })
    token_type!: string | null;
  
    @Column({ type: "varchar2", length: 512, nullable: true })
    scope!: string | null;
  
    @Column({ type: "varchar2", length: 2048, nullable: true })
    id_token!: string | null;
  
    @Column({ type: "varchar2", length: 255, nullable: true })
    session_state!: string | null;
  
    @Column({ type: "varchar2", length: 512, nullable: true })
    oauth_token_secret!: string | null;
  
    @Column({ type: "varchar2", length: 512, nullable: true })
    oauth_token!: string | null;
  
    @ManyToOne(() => UserEntity, (user) => user.accounts, {
      createForeignKeyConstraints: true,
    })
    user!: UserEntity;
  }
  
  @Entity({ name: "sessions" })
  export class SessionEntity {
    @PrimaryGeneratedColumn("uuid") // Use VARCHAR2(36)
    id!: string;
  
    @Column({ unique: true, type: "varchar2", length: 255 })
    sessionToken!: string;
  
    @Column({ type: "varchar2", length: 36 })
    userId!: string;
  
    @Column({ type: "timestamp" }) // Oracle supports TIMESTAMP
    expires!: string;
  
    @ManyToOne(() => UserEntity, (user) => user.sessions)
    user!: UserEntity;
  }
  
  @Entity({ name: "verification_tokens" })
  export class VerificationTokenEntity {
    @PrimaryGeneratedColumn("uuid") // Use VARCHAR2(36)
    id!: string;
  
    @Column({ type: "varchar2", length: 255 })
    token!: string;
  
    @Column({ type: "varchar2", length: 255 })
    identifier!: string;
  
    @Column({ type: "timestamp" }) 
    expires!: string;
  }
  