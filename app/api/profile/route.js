import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import { getProfileController, updateProfileController } from "@/controllers/profile.controller";

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
    if (error.message === "PROFILE_NOT_FOUND") {
      return NextResponse.json({ message: 'Profile not found' }, { status: 404 });
    }

    console.error("GET Profile Error:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
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
    console.error("POST Profile Error:", error);

    return NextResponse.json({
      success: false,
      message: 'Server error'
    }, { status: 500 });
  }
}