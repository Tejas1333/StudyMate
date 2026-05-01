import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
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
    console.error("GET Quiz Error:", err);

    return NextResponse.json(
      { success: false, error: "Server error while fetching history." },
      { status: 500 }
    );
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
    console.error("POST Quiz Error:", err);

    if (err.message === "INVALID_BODY") {
      return NextResponse.json(
        { success: false, error: "Invalid request body." },
        { status: 400 }
      );
    }

    if (err.message.startsWith("VALIDATION_ERROR")) {
      return NextResponse.json(
        { success: false, error: err.message.replace("VALIDATION_ERROR:", "") },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Server error while saving quiz." },
      { status: 400 }
    );
  }
}