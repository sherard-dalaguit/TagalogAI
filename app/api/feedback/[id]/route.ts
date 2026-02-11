import {NextResponse} from "next/server";
import dbConnect from "@/lib/mongoose";
import FeedbackSummary, {IFeedbackSummaryDoc} from "@/database/feedback-summary.model";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const { id } = await params;
  const body = await request.json();
  const { userId } = await body;

  // const feedback = await runAIReview()
  // runAIReview() will be implemented in the feedback section
  // for now, we'll just use this mock data below
  const feedback = {
    userId,
    sessionId: id,
    highlights: [
      "Maganda ang flow ng conversation—nakakasunod ka at hindi ka natitigilan kapag may follow-up question.",
      "Good job sa paggamit ng polite markers tulad ng “po/opo” (kahit minsan inconsistent), which helps your tone sound respectful.",
      "Malinaw ang intent mo kapag nagre-request ka (e.g., asking for help, directions, or clarification).",
      "Nice attempt at connecting ideas using basic linkers like “kasi” and “pero”."
    ],
    topRecurringMistakes: [
      "Particles placement: madalas napupunta sa awkward spot ang “na / pa / naman” (e.g., better positioning to sound natural).",
      "Verb aspect mismatch: nagmi-mix ng completed vs ongoing actions (e.g., “kumain ako” vs “kumakain ako”) kahit hindi tugma sa context.",
      "Pronoun/marker confusion: nalilito minsan sa “ng / nang” at “ang / ng” roles (actor vs object/topic).",
      "Over-Taglish as a crutch: gumagamit ng English kapag may mas simple namang Tagalog alternative (okay lang, but let’s build confidence)."
    ],
    improvedPhrases: [
      {
        original: "Punta ako sa mall kahapon, tapos bumili ako ng pagkain kasi gutom na ako ngayon.",
        improved: "Pumunta ako sa mall kahapon, tapos bumili ako ng pagkain kasi gutom na ako noon.",
        explanation: "Tugmain natin ang time reference: kung “kahapon,” mas natural ang “noon” kaysa “ngayon.” Bonus: “Pumunta” sounds more complete/past than “Punta ako” in this context."
      },
      {
        original: "Pwede mo bigay sa akin yung advice?",
        improved: "Puwede mo bang ibigay sa akin yung advice?",
        explanation: "Mas natural ang request kapag may “bang” after the modal (“puwede”) and full verb form (“ibigay”)."
      },
      {
        original: "Nag-aaral ako kahapon ng Tagalog.",
        improved: "Nag-aral ako ng Tagalog kahapon.",
        explanation: "Kung tapos na yung action at specific time (kahapon), use completed aspect: “nag-aral.” “Nag-aaral” is more ongoing/habitual."
      },
      {
        original: "Nagpunta kami sa bahay ng friend ko at kumain kami na.",
        improved: "Nagpunta kami sa bahay ng kaibigan ko at kumain na kami.",
        explanation: "Mas natural ang placement ng “na” right before/after the verb phrase it modifies (“kumain na kami”), not at the end."
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