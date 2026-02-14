import {NextResponse} from "next/server";
import dbConnect from "@/lib/mongoose";
import FeedbackSummary, {IFeedbackSummaryDoc} from "@/database/feedback-summary.model";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const { id } = await params;
  const body = await request.json();
  const { userId, transcript } = await body;

  console.log('Transcript used in /api/feedback/[id]: ', transcript)

  // const feedback = await runAIReview()
  // runAIReview() will be implemented in the feedback section
  // for now, we'll just use this mock data below
  const feedback = {
    userId,
    sessionId: id,
    overview: {
      estimatedLevel: "Lower-Intermediate",
      confidence: 0.85,
      fluencyNotes: ["Good pacing", "Occasionally pauses for word choice", "Natural intonation"],
    },
    highlights: [
      "Maganda ang flow ng conversation—nakakasunod ka at hindi ka natitigilan kapag may follow-up question.",
      "Good job sa paggamit ng polite markers tulad ng “po/opo” (kahit minsan inconsistent), which helps your tone sound respectful.",
      "Malinaw ang intent mo kapag nagre-request ka (e.g., asking for help, directions, or clarification).",
      "Nice attempt at connecting ideas using basic linkers like “kasi” and “pero”."
    ],
    topRecurringMistakes: [
      {
        category: "particles",
        mistake: "Misplacement of 'na' and 'pa'",
        why: "Particles like 'na' and 'pa' usually follow the first word of the phrase they modify.",
        exampleFix: "Kumain na ako (instead of Kumain ako na)"
      },
      {
        category: "grammar",
        mistake: "Verb aspect mismatch",
        why: "Using ongoing aspect for completed actions.",
        exampleFix: "Pumunta ako (completed) vs Pumupunta ako (ongoing)"
      }
    ],
    improvedPhrases: [
      {
        original: "Punta ako sa mall kahapon, tapos bumili ako ng pagkain kasi gutom na ako ngayon.",
        improved: "Pumunta ako sa mall kahapon, tapos bumili ako ng pagkain kasi gutom na ako noon.",
        explanation: "Tugmain natin ang time reference: kung “kahapon,” mas natural ang “noon” kaysa “ngayon.” Bonus: “Pumunta” sounds more complete/past than “Punta ako” in this context.",
        category: "grammar"
      },
      {
        original: "Pwede mo bigay sa akin yung advice?",
        improved: "Puwede mo bang ibigay sa akin yung advice?",
        explanation: "Mas natural ang request kapag may “bang” after the modal (“puwede”) and full verb form (“ibigay”).",
        category: "naturalness"
      }
    ],
    nextPractice: [
      {
        goal: "Mastering Enclitic Particles",
        drill: "Practice placing 'na' and 'pa' in short sentences.",
        examples: ["Tapos na ako.", "Hindi pa po."]
      }
    ]
  };

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