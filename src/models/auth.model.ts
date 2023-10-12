import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToMany,
} from "typeorm";
import { Result } from "./result.model";

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({})
  password: string;

  @Column()
  name: string;

  @Column()
  dateOfBirth: Date;

  @Column()
  phone: string;

  @Column({ default: false })
  isAdmin: boolean;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;

  @OneToMany((type) => Result, (result) => result.user)
  results: Result[];
}
