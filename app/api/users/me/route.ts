import { auth } from "@/auth";
import dbConnect from "@/lib/mongoose";
import User from "@/database/user.model";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const user = await User.findById(session.user.id);

  if (!user) {
    return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: user });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { preferences } = body;

    await dbConnect();
    const user = await User.findByIdAndUpdate(
      session.user.id,
      { $set: { preferences } },
      { new: true, runValidators: true }
    );

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    console.error("Error updating preferences:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
