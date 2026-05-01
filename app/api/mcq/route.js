import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { handleError } from "@/lib/errorHandler";
import {
  getQuizHistoryController,
  createQuizController
} from "@/controllers/quiz.controller";

// 🔹 GET QUIZ HISTORY
export async function GET() {
  try {
    await dbConnect();

    const quizzes = await getQuizHistoryController();

    return NextResponse.json({
      success: true,
      history: quizzes
    });

  } catch (err) {
    return handleError(err);
  }
}

// 🔹 CREATE QUIZ
export async function POST(req) {
  try {
    await dbConnect();

    const quiz = await createQuizController(req);

    return NextResponse.json(
      { success: true, savedQuiz: quiz },
      { status: 201 }
    );

  } catch (err) {
    return handleError(err);
  }
}