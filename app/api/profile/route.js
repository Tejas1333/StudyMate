import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import { getProfileController, updateProfileController } from "@/controllers/profile.controller";
import { handleError } from "@/lib/errorHandler";

// =====================
// 🔹 GET PROFILE
// =====================
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    await dbConnect();

    const data = await getProfileController(session.user.email);

    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    return handleError(err);
  }
}

// =====================
// 🔹 UPDATE PROFILE
// =====================
export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();

    const updatedProfile = await updateProfileController(
      session.user.email,
      request
    );

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully!',
      data: updatedProfile
    }, { status: 200 });

  } catch (error) {
    return handleError(err);
  }
}