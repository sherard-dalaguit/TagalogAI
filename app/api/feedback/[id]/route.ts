import {NextResponse} from "next/server";
import dbConnect from "@/lib/mongoose";
import FeedbackSummary, {IFeedbackSummaryDoc} from "@/database/feedback-summary.model";
import {runAIReview} from "@/lib/server/runAIReview";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const { id } = await params;
  const { userId, transcript, correctionIntensity, taglishMode, preferredTone,
          scenarioId, scenarioTitle, aiRole, scenarioStages } = await request.json();

  console.log('Transcript used in /api/feedback/[id]: ', transcript)

  const scenarioContext = scenarioId
    ? { id: scenarioId, title: scenarioTitle ?? scenarioId, aiRole: aiRole ?? "AI character", stages: scenarioStages ?? [] }
    : null;

  const feedback = await runAIReview(userId, id, transcript, correctionIntensity, taglishMode, preferredTone, scenarioContext);

  await dbConnect();

  const feedbackSummary: IFeedbackSummaryDoc = await FeedbackSummary.create(feedback)

  return NextResponse.json({ success: true, data: feedbackSummary });
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const { id } = await params;

  await dbConnect();

  const feedbackSummary = await FeedbackSummary.findOne({ sessionId: id });

  if (!feedbackSummary) {
    return NextResponse.json({ success: false, message: "Feedback not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: feedbackSummary });
}