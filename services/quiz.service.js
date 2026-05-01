import mongoose from "mongoose";
import { findAllQuizzes, createQuiz } from "@/repositories/quiz.repo";

export const getQuizHistoryService = async () => {
  return await findAllQuizzes();
};

export const createQuizService = async (body) => {
  // (Optional) basic validation — extend later with Zod
  if (!body) {
    throw new Error("INVALID_BODY");
  }

  try {
    return await createQuiz(body);
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
      throw new Error("VALIDATION_ERROR:" + err.message);
    }
    throw err;
  }
};