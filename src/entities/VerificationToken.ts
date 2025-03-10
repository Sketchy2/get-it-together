import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("VERIFICATION_TOKEN")
export class VerificationToken {
  @PrimaryColumn({ name: "IDENTIFIER", length: 255 })
  identifier: string;

  @PrimaryColumn({ name: "TOKEN", length: 255, unique: true })
  token: string;

  @Column({ name: "EXPIRES", type: "timestamp" })
  expires: Date;
}
