import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("VERIFICATION_TOKEN")
export class VerificationToken {
  @PrimaryColumn({ length: 255 })
  identifier: string;

  @PrimaryColumn({ length: 255, unique: true })
  token: string;

  @Column({ type: "timestamp" })
  expires: Date;
}
