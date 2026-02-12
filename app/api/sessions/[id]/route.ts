import {auth} from "@/auth";
import {NextResponse} from "next/server";
import dbConnect from "@/lib/mongoose";
import VoiceSession from "@/database/voice-session.model";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const { id } = await params;

  const session = await auth();
  const user = session?.user;

  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const voiceSession = await VoiceSession.findOne({
    _id: id,
    userId: user.id
  });

  return NextResponse.json({ success: true, data: voiceSession });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const { id } = await params;
  const body = await request.json();
  const { transcript } = body;

  const session = await auth();
  const user = session?.user;

  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const voiceSession = await VoiceSession.findOneAndUpdate(
    { _id: id, userId: user.id },
    { transcript },
    { new: true }
  );

  if (!voiceSession) {
    return NextResponse.json({ success: false, message: "Session not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: voiceSession });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const { id } = await params;

  const session = await auth();
  const user = session?.user;

  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  await VoiceSession.deleteOne({
    _id: id,
    userId: user.id
  });

  return NextResponse.json({ success: true });
}