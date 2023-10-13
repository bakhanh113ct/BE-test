import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToMany,
  ManyToOne,
} from "typeorm";
import { Result } from "./result.model";
import { Question } from "./question.model";

@Entity()
export class ResultDetail extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  answerByUser: string;

  @Column()
  isCorrect: boolean;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;

  @ManyToOne((type) => Result, (result) => result.resultDetails)
  result: Result;

  @ManyToOne((type) => Question, (question) => question.resultDetails)
  question: Question;
}
