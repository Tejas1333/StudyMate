import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { handleError } from "@/lib/errorHandler";
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
    return handleError(err);
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
    return handleError(err);
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
   return handleError(err);
  }
}