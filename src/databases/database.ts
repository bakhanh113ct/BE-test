import mysql2 from "mysql2";
import { DataSource } from "typeorm";
import { User } from "../models/auth.model";
import { Result } from "../models/result.model";
import { TestSet } from "../models/testSet.model";
import { Test } from "../models/test.model";
import { Part } from "../models/part.model";
import { PartDetail } from "../models/partDetail.model";
import { Question } from "../models/question.model";
import { ResultDetail } from "../models/resultDetail.model";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: +3306,
  username: "root",
  password: "1111",
  database: "cnweb",
  synchronize: true,
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
});
