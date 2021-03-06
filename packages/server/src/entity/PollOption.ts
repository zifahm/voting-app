import {
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Entity
} from "typeorm";
import { Poll } from "./Poll";
@Entity()
export class PollOption extends BaseEntity {
  @PrimaryGeneratedColumn() id: number;

  @Column("text") text: string;

  @Column() votes: number;

  @Column() pollId: number;

  @ManyToOne(() => Poll, poll => poll.options, { onDelete: "CASCADE" })
  poll: Poll;
}
