import { NextFunction, Request, Response } from "express";
import { Test } from "../models/test.model";
import { PartDetail } from "../models/partDetail.model";
import { Question } from "../models/question.model";
import { ResultDetail } from "../models/resultDetail.model";
import { Result } from "../models/result.model";
import { User } from "../models/auth.model";
import { ResultPart } from "../models/resultPart.model";
import { Part } from "../models/part.model";
import { DataSource } from "typeorm";
import { AppDataSource } from "../databases/database";
import { TestSet } from "../models/testSet.model";

const getAllTest = async (req: Request, res: Response, next: NextFunction) => {
  const tests = await TestSet.createQueryBuilder("testSet")
    .innerJoinAndSelect("testSet.tests", "test")
    .orderBy('test.title')
    .addOrderBy('testSet.title', 'DESC')
    .getMany();

  console.log(tests);
  return res.json(tests);
};

const getTestById = async (req: Request, res: Response, next: NextFunction) => {
  const test = await Test.findOneBy({ id: Number(req.params.testId) });
  const testPart = await PartDetail.find({
    where: { test: { id: Number(req.params.testId) } },
  });

  for (var i = 0; i < testPart.length; i++) {
    const questions = await Question.find({
      where: { partDetail: { id: Number(testPart[i].id) } },
      select: {
        id: true,
        index: true,
        question: true,
        answer: true,
        imageUrl: true,
        audioUrl: true,
        A: true,
        B: true,
        C: true,
        D: true,
      },
    });

    testPart[i].questions = questions;
  }

  return res.json({
    test: test,
    testParts: testPart,
  });
};

const getSolutionsById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const test = await Question.createQueryBuilder("question")
    .innerJoinAndSelect(
      "question.partDetail",
      "partDetail",
      "question.partDetailId = partDetail.id"
    )
    .orderBy("question.index")
    .where("partDetail.testId = :testId", { testId: req.params.testId })
    .select("question.answer")
    .addSelect("question.index")
    .getMany();

  console.log(test);

  return res.json(test);
};

const getPartSolutionsById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // console.log(req.params.partNumber);
  const test = await Question.createQueryBuilder("question")
    .innerJoinAndSelect(
      "question.partDetail",
      "partDetail",
      "question.partDetailId = partDetail.id"
    )
    .innerJoinAndSelect(
      "partDetail.part",
      "part",
      "part.id = partDetail.partId"
    )
    .orderBy("question.index")
    .where("partDetail.testId = :testId", { testId: req.params.testId })
    .andWhere("part.id = :partNumber", {
      partNumber: req.params.partNumber,
    })
    .select("question.answer")
    .addSelect("question.index")
    .getMany();

  return res.json(test);
};

const submitTest = async (req: Request, res: Response, next: NextFunction) => {
  const params = req.body;
  var readingCorrectCount = 0;
  var listeningCorrectCount = 0;

  const questions = await Question.createQueryBuilder("question")
    .innerJoinAndSelect(
      "question.partDetail",
      "partDetail",
      "question.partDetailId = partDetail.id"
    )
    .innerJoinAndSelect(
      "partDetail.part",
      "part",
      "part.id = partDetail.partId"
    )
    .groupBy("question.id")
    .addGroupBy("partDetail.id")
    .addGroupBy("part.id")
    .orderBy("question.id", "ASC")
    .where("partDetail.testId = :testId", { testId: req.params.testId })
    .andWhere("part.number IN(:...numbers)", { numbers: params["parts"] })
    .getMany();

  // console.log(questions);

  const result = await Result.create({
    state: "done",
    score: "0",
    time: params["time"],
    user: { id: req.auth.userId },
    test: { id: Number(req.params.testId) },
    dateComplete: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }).save();

  //Thêm result part
  params["parts"].map(async (value, index) => {
    const part = await Part.findOne({
      where: {
        number: value,
      },
    });

    await ResultPart.create({
      partNumber: value,
      part: part,
      result: result,
    }).save();
  });

  questions.map(async (question, index) => {
    // console.log(params["answers"][value.index.toString()]);
    const resultDetail = ResultDetail.create({
      answerByUser: params["answers"][question.index] ?? null,
      isCorrect:
        params["answers"][question.index] == question.answer ? true : false,
      createdAt: new Date(),
      updatedAt: new Date(),
      question: question,
      result: result,
    });

    console.log(resultDetail.isCorrect);

    //thêm câu đúng
    if (resultDetail.isCorrect && Number(question.index) <= 100) {
      readingCorrectCount += 1;
    } else if (resultDetail.isCorrect) {
      listeningCorrectCount += 1;
    }

    await ResultDetail.insert(resultDetail);
  });

  console.log(readingCorrectCount);
  //tính score
  result.score = (
    (readingCorrectCount * 5 > 495 ? 495 : readingCorrectCount * 5) +
    (listeningCorrectCount * 5 > 495 ? 495 : listeningCorrectCount * 5)
  ).toString();

  result.correctCount = readingCorrectCount + listeningCorrectCount;
  result.readingCorrectCount = readingCorrectCount;
  result.listeningCorrectCount = listeningCorrectCount;
  await result.save();

  const {
    user: _,
    test: __,
    createdAt: ___,
    updatedAt: ____,
    dateComplete: _____,
    ...rs
  } = result;

  return res.json(rs || {});
};

const getTestResults = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const params = req.params;

  // const test = await Test.findOne({
  //   where: {
  //     id: params.testId,
  //   },
  // });
  const results = await Result.find({
    where: {
      test: { id: Number(params.testId) || -1 },
    },
    relations: {
      resultParts: true,
    },
  });

  console.log(results);

  res.json(results);
};

const getDetailResult = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const params = req.params;

  const result = await Result.createQueryBuilder("result")
    .innerJoinAndSelect("result.resultParts", "resultPart")
    .innerJoinAndSelect("result.resultDetails", "resultDetail")
    .innerJoinAndSelect("resultDetail.question", "question")
    .innerJoinAndSelect("question.partDetail", "partDetail")
    .orderBy("question.index", "ASC")
    .where("result.id = :id", { id: params.resultId })
    .getOne();

  console.log(result);

  res.json({
    ...result,
    readingScore: result.readingCorrectCount * 5,
    listeningScore: result.listeningCorrectCount * 5,
  });
};

export {
  getTestById,
  getSolutionsById,
  getPartSolutionsById,
  submitTest,
  getAllTest,
  getTestResults,
  getDetailResult,
};
