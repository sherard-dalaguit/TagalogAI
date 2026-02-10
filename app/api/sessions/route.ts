import {NextResponse} from "next/server";
import dbConnect from "@/lib/mongoose";
import VoiceSession, {ITranscriptMessage} from "@/database/voice-session.model";
import {auth} from "@/auth";

export async function POST(request: Request): Promise<NextResponse> {
  await dbConnect();

  const { userId, mode, scenario, correctionIntensity, taglishMode } = await request.json();

  const transcript: ITranscriptMessage[] = []; // placeholder for now

  const voiceSession = await VoiceSession.create({
    userId,
    mode,
    scenario,
    transcript,
    correctionIntensity,
    taglishMode,
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