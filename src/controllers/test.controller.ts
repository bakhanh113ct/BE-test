import { NextFunction, Request, Response } from "express";
import { Test } from "../models/test.model";
import { PartDetail } from "../models/partDetail.model";
import { Question } from "../models/question.model";
import { ResultDetail } from "../models/resultDetail.model";
import { Result } from "../models/result.model";
import { User } from "../models/auth.model";

const getAllTest = async (req: Request, res: Response, next: NextFunction) => {
  const tests = await Test.find();

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
  const test = await Question.createQueryBuilder("question")
    .innerJoinAndSelect(
      "question.partDetail",
      "partDetail",
      "question.partDetailId = partDetail.id"
    )
    .innerJoin("partDetail.part", "part", "part.id = partDetail.partId")
    .where("partDetail.testId = :testId", { testId: req.params.testId })
    .where("part.number = :partNumber", { partNumber: req.params.partNumber })
    .select("question.answer")
    .addSelect("question.index")
    .getMany();

  return res.json(test);
};

const submitTest = async (req: Request, res: Response, next: NextFunction) => {
  const params = req.body;
  console.log(params);

  const questions = await Question.createQueryBuilder("question")
    .innerJoinAndSelect(
      "question.partDetail",
      "partDetail",
      "question.partDetailId = partDetail.id"
    )
    .where("partDetail.testId = :testId", { testId: req.params.testId })
    // .select('question')
    // .addSelect('partDetail')
    // .addSelect("partDetail.test")
    // .addSelect("")
    // // .addSelect("question.index")
    .getMany();

  console.log(questions);

  const user = User.create({ id: req.auth.userId });
  const test = Test.create({ id: Number(req.params.testId) });
  const result = Result.create({
    state: "done",
    score: "0",
    time: "0",
    user: user,
    test: test,
    dateComplete: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await result.save();

  var questionCorrectCount = 0;

  questions.map(async (value, index) => {
    const resultDetail = ResultDetail.create({
      answerByUser: params[value.index] ?? null,
      isCorrect: params[value.index] == value.answer ? true : false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    resultDetail.question = value;

    questionCorrectCount += resultDetail.isCorrect ? 1 : 0;

    resultDetail.result = result;

    await resultDetail.save();
  });

  result.score = questionCorrectCount.toString();
  await result.save();

  const { user: _, test: __, createdAt: ___, updatedAt: ____, ...rs } = result;

  return res.json(rs);
};

export {
  getTestById,
  getSolutionsById,
  getPartSolutionsById,
  submitTest,
  getAllTest,
};
