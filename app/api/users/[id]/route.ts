import { auth } from "@/auth";
import dbConnect from "@/lib/mongoose";
import User from "@/database/user.model";
import VoiceSession from "@/database/voice-session.model";
import FeedbackSummary from "@/database/feedback-summary.model";
import Account from "@/database/account.model";
import { Assessment } from "@/database/assessment.model";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id || session.user.id !== id) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    // Delete everything tied to the account
    await FeedbackSummary.deleteMany({ userId: id });
    await Assessment.deleteMany({ userId: id });
    await VoiceSession.deleteMany({ userId: id });
    await Account.deleteMany({ userId: id });
    
    const userDeleted = await User.findByIdAndDelete(id);

    if (!userDeleted) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Account and all related data deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting account:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
