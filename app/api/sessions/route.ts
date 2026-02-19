import {NextResponse} from "next/server";
import dbConnect from "@/lib/mongoose";
import VoiceSession from "@/database/voice-session.model";
import {auth} from "@/auth";
import {getDailyUsage} from "@/lib/server/usage";

export async function POST(request: Request): Promise<NextResponse> {
  await dbConnect();

  const session = await auth();
  const user = session?.user;

  if (!user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { mode, scenario, correctionIntensity, taglishMode, transcript } = await request.json();

  // Check daily usage before starting
  const usage = await getDailyUsage(user.id);
  if (usage.remainingSeconds <= 0) {
    return NextResponse.json({ success: false, message: "Daily limit reached" }, { status: 403 });
  }

  const voiceSession = await VoiceSession.create({
    userId: user.id,
    mode,
    scenario,
    transcript: transcript || [],
    correctionIntensity,
    taglishMode,
    startedAt: new Date(),
  });

  return NextResponse.json({ success: true, data: voiceSession });
}

export async function GET(_: Request): Promise<NextResponse> {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const voiceSessions = await VoiceSession.find({ userId: user.id })

  return NextResponse.json({ success: true, data: voiceSessions });
}