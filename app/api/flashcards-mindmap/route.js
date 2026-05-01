import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import {
  getMaterialsController,
  createMaterialController,
  updateMaterialController
} from "@/controllers/flashcards.controller";

// 🔹 GET
export async function GET() {
  try {
    await dbConnect();
    const materials = await getMaterialsController();

    return NextResponse.json({
      success: true,
      history: materials
    });

  } catch (err) {
    console.error("GET Error:", err);

    return NextResponse.json(
      { success: false, error: "Server error while fetching history." },
      { status: 500 }
    );
  }
}

// 🔹 POST
export async function POST(req) {
  try {
    await dbConnect();

    const newMaterial = await createMaterialController(req);

    return NextResponse.json(
      { success: true, savedMaterial: newMaterial },
      { status: 201 }
    );

  } catch (err) {
    console.error("POST Error:", err);

    if (err.message === "MISSING_FIELDS") {
      return NextResponse.json(
        { success: false, error: "Missing required fields: topic or flashcards." },
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
      { success: false, error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}

// 🔹 PUT
export async function PUT(req) {
  try {
    await dbConnect();

    const updatedMaterial = await updateMaterialController(req);

    return NextResponse.json({
      success: true,
      updatedMaterial
    });

  } catch (err) {
    console.error("PUT Error:", err);

    if (err.message === "MISSING_ID") {
      return NextResponse.json(
        { success: false, error: "Missing document ID." },
        { status: 400 }
      );
    }

    if (err.message === "NO_UPDATE_DATA") {
      return NextResponse.json(
        { success: false, error: "Missing topic or flashcards data for update." },
        { status: 400 }
      );
    }

    if (err.message === "NOT_FOUND") {
      return NextResponse.json(
        { success: false, error: "Document not found." },
        { status: 404 }
      );
    }

    if (err.message.startsWith("VALIDATION_ERROR")) {
      return NextResponse.json(
        { success: false, error: err.message.replace("VALIDATION_ERROR:", "") },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}