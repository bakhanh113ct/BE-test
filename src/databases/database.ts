import { DataSource } from "typeorm";
import fs from "fs";
import { User } from "../models/auth.model";
import { Result } from "../models/result.model";
import { TestSet } from "../models/testSet.model";
import { Test } from "../models/test.model";
import { Part } from "../models/part.model";
import { PartDetail } from "../models/partDetail.model";
import { Question } from "../models/question.model";
import { ResultDetail } from "../models/resultDetail.model";
import { config } from "dotenv";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: 'dpg-ckju62pjrl0c73fq6pj0-a.singapore-postgres.render.com',
  port: 5432,
  username: 'eztoeic_user',
  password: 'fLVFqX9xzNaifgQbx8opNoEILPCrKOwf',
  database: 'eztoeic',
  synchronize: true,
  logging: true,
  entities: [
    User,
    Result,
    TestSet,
    Test,
    Part,
    PartDetail,
    Question,
    ResultDetail,
  ],
  subscribers: [],
  migrations: [],
  ssl: true,
});
