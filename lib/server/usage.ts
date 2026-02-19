import dbConnect from "@/lib/mongoose";
import VoiceSession from "@/database/voice-session.model";

export const DAILY_LIMIT_SECONDS = 600; // 10 minutes

export async function getDailyUsage(userId: string) {
  await dbConnect();

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const sessions = await VoiceSession.find({
    userId,
    createdAt: { $gte: startOfDay, $lte: endOfDay }
  });

  const totalSeconds = sessions.reduce((acc, session) => acc + (session.durationSeconds || 0), 0);

  return {
    totalSeconds,
    dailyLimitSeconds: DAILY_LIMIT_SECONDS,
    remainingSeconds: Math.max(0, DAILY_LIMIT_SECONDS - totalSeconds)
  };
}
