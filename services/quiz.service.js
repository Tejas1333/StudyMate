import mongoose from "mongoose";
import { findAllQuizzes, createQuiz } from "@/repositories/quiz.repo";

export const getQuizHistoryService = async () => {
  return await findAllQuizzes();
};

export const createQuizService = async (body) => {
  if (!body) {
    throw new Error("INVALID_BODY");
  }

  // 🔴 IMPORTANT VALIDATION
  const {
    topic,
    score,
    totalQuestions,
    questions,
    userAnswers,
    inputType
  } = body;

  if (!topic || !questions || !userAnswers || !inputType) {
    throw new Error("MISSING_REQUIRED_FIELDS");
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