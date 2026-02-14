import { model, models, Schema, Types, Document } from "mongoose";

export interface IFeedbackSummary {
  userId: Types.ObjectId;
  sessionId: Types.ObjectId;

  overview: {
    estimatedLevel: string;
    confidence: number;
    fluencyNotes: string[];
  };

  highlights: string[];

  topRecurringMistakes: {
    category: string;
    mistake: string;
    why: string;
    exampleFix: string;
  }[];

  improvedPhrases: {
    original: string;
    improved: string;
    explanation: string;
    category: string;
  }[];

  nextPractice: {
    goal: string;
    drill: string;
    examples: string[];
  }[];
}

export interface IFeedbackSummaryDoc extends IFeedbackSummary, Document {}
const FeedbackSummarySchema = new Schema<IFeedbackSummary>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: "VoiceSession", required: true },

    // quick overview for UI header
    overview: {
      estimatedLevel: { type: String, required: true }, // "Beginner" | "Lower-Intermediate" | ...
      confidence: { type: Number, required: true },     // 0-1
      fluencyNotes: { type: [String], required: true },
    },

    // positive reinforcement (keep this)
    highlights: { type: [String], required: true },

    // recurring issues (better as objects, not just strings)
    topRecurringMistakes: {
      type: [
        {
          category: { type: String, required: true }, // "grammar" | "vocab" | "wording" | "particles" | "pronouns"
          mistake: { type: String, required: true },
          why: { type: String, required: true },
          exampleFix: { type: String, required: true },
        },
      ],
      required: true,
    },

    // your improvedPhrases but more deterministic + UI-friendly
    improvedPhrases: {
      type: [
        {
          original: { type: String, required: true },
          improved: { type: String, required: true },
          explanation: { type: String, required: true },

          // optional but super useful for UI
          category: { type: String, required: true }, // "naturalness" | "grammar" | "tone" | "clarity"
        },
      ],
      required: true,
    },

    // lightweight “homework”
    nextPractice: {
      type: [
        {
          goal: { type: String, required: true },
          drill: { type: String, required: true },      // what to do
          examples: { type: [String], required: true }, // 2-4 examples
        },
      ],
      required: true,
    },
  },
  { timestamps: true }
)

const FeedbackSummary = models?.FeedbackSummary || model<IFeedbackSummary>("FeedbackSummary", FeedbackSummarySchema);

export default FeedbackSummary;