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

config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  synchronize: false,
  logging: false,
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
