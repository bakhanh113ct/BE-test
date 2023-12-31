import express, { Router } from "express";
import { verifyAccessToken } from "../utils/jwt.service";
import {
  getTestById,
  getSolutionsById,
  getPartSolutionsById,
  submitTest,
  getAllTest,
  getTestResults,
  getDetailResult,
} from "../controllers/test.controller";

const testRoute: Router = express.Router();
testRoute.get("/", verifyAccessToken, getAllTest);
testRoute.get("/:testId", verifyAccessToken, getTestById);
testRoute.get("/:testId/solutions", verifyAccessToken, getSolutionsById);
testRoute.get(
  "/:testId/:partNumber/solutions",
  verifyAccessToken,
  getPartSolutionsById
);
testRoute.post("/:testId/finish", verifyAccessToken, submitTest);
testRoute.get("/:testId/results", verifyAccessToken, getTestResults);
testRoute.get('/:testId/results/:resultId', verifyAccessToken, getDetailResult)

export default testRoute;
