import { model, models, Schema, Types, Document } from "mongoose";

export interface ITranscriptMessage {
  order?: number;
  speaker: "user" | "ai" | "unknown";
  text: string;
}

export interface IVoiceSession {
  userId: Types.ObjectId;

  mode?: "conversation" | "beginner" | "repeat_after_me" | "speak_like_a_local" | "assessment";
  scenario?: "daily_life" | "ordering_food" | "directions" | "meeting_someone" | "dating" | "family";

  transcript: ITranscriptMessage[];

  correctionIntensity: "minimal" | "moderate" | "aggressive";
  taglishMode: boolean;

  feedbackSummaryId?: Types.ObjectId;
  assessmentId?: Types.ObjectId;

  startedAt?: Date;
  endedAt?: Date;
  durationSeconds?: number;

  createdAt?: Date;
  updatedAt?: Date;
}

const TranscriptMessageSchema = new Schema<ITranscriptMessage>(
  {
    order: { type: Number },
    speaker: { type: String, enum: ["user", "ai", "unknown"], required: true },
    text: { type: String, required: true },
  }
)

export interface IVoiceSessionDoc extends IVoiceSession, Document {}
const VoiceSessionSchema = new Schema<IVoiceSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    mode: { type: String, enum: ["conversation", "beginner", "repeat_after_me", "speak_like_a_local", "assessment"] },
    scenario: { type: String, enum: ["daily_life", "ordering_food", "directions", "meeting_someone", "dating", "family"] },

    transcript: { type: [TranscriptMessageSchema], required: true },

    correctionIntensity: { type: String, enum: ["minimal", "moderate", "aggressive"], default: "moderate", required: true },
    taglishMode: { type: Boolean, default: false, required: true },

    feedbackSummaryId: { type: Schema.Types.ObjectId, ref: "FeedbackSummary" },
    assessmentId: { type: Types.ObjectId, ref: "Assessment" },

    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
    durationSeconds: { type: Number, default: 0 },
  },
  { timestamps: true }
)

const VoiceSession = models?.VoiceSession || model<IVoiceSession>("VoiceSession", VoiceSessionSchema)

export default VoiceSession