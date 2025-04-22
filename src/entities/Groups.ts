import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
    CreateDateColumn,
  } from "typeorm";
  import type { Relation } from "typeorm";
  import { User } from "./auth-entities";
  import { Assignment } from "./Assignments";
  
  /**
   * Represents a user group in the system.
   */
  @Entity("group")
  export class Group {
    /** Primary key */
    @PrimaryGeneratedColumn({ name: "group_id" })
    id: number;
  
    /** Human-readable group name */
    @Column({ name: "group_name", type: "varchar", length: 255 })
    name: string;

    /** Relation to creator user */
    @ManyToOne(() => User, (user) => user.groupsCreated)
    @JoinColumn({ name: "created_by" })
    creator: Relation<User>;
  
    /** Timestamp when the group was created */
    @CreateDateColumn({ name: "created_at", type: "timestamp" })
    createdAt: Date;
  
    /** Assignments belonging to this group */
    @OneToMany(() => Assignment, (assignment) => assignment.group)
    assignments: Relation<Assignment[]>;
  
    /** Members of this group */
    @OneToMany(() => GroupMember, (member) => member.group)
    members: Relation<GroupMember[]>;
  }
  
  /**
   * Junction entity linking users to groups with roles.
   */
  @Entity("group_member")
  export class GroupMember {
    /** Primary key */
    @PrimaryGeneratedColumn({ name: "group_member_id" })
    id: number;
  
    /** Role of the user within the group */
    @Column({ name: "role_in_group", type: "varchar", length: 100 })
    role: string;
  
    /** Relation to User */
    @ManyToOne(() => User, (user) => user.groupMemberships)
    @JoinColumn({ name: "user_id" })
    user: Relation<User>;
  
    /** Relation to Group */
    @ManyToOne(() => Group, (group) => group.members)
    @JoinColumn({ name: "group_id" })
    group: Relation<Group>;
  }
  