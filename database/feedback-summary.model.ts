import { model, models, Schema, Types, Document } from "mongoose";

export interface IFeedbackSummary {
  userId: Types.ObjectId;
  sessionId: Types.ObjectId;

  highlights: string[];
  topRecurringMistakes: string[];
  improvedPhrases: {
    original: string;
    improved: string;
    explanation: string;
  }[]
}

export interface IFeedbackSummaryDoc extends IFeedbackSummary, Document {}
const FeedbackSummarySchema = new Schema<IFeedbackSummary>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: "VoiceSession", required: true },

    highlights: { type: [String], required: true },
    topRecurringMistakes: { type: [String], required: true },
    improvedPhrases: { type: [{ original: String, improved: String, explanation: String }], required: true }
  }
)

const FeedbackSummary = models?.FeedbackSummary || model<IFeedbackSummary>("FeedbackSummary", FeedbackSummarySchema);

export default FeedbackSummary;