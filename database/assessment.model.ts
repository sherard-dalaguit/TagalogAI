import { model, models, Schema, Types, Document } from "mongoose";

export interface IAssessmentPrompt {
  key: string;
  level: "A0" | "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  difficulty?: "easy" | "medium" | "hard";
  promptText: string;
  topic?: "food" | "family" | "directions" | "dating" | "small_talk";
  timeLimitSeconds?: number;
  targetSeconds?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAssessmentPromptDoc extends IAssessmentPrompt, Document {}

const AssessmentPromptSchema = new Schema<IAssessmentPrompt>(
  {
    key: { type: String, required: true, unique: true },
    level: { type: String, enum: ["A0", "A1", "A2", "B1", "B2", "C1", "C2"], required: true },
    difficulty: { type: String, enum: ["easy", "medium", "hard"] },
    promptText: { type: String, required: true },
    topic: { type: String, enum: ["food", "family", "directions", "dating", "small_talk"] },
    timeLimitSeconds: { type: Number },
    targetSeconds: { type: Number },
  },
  { timestamps: true }
);

export interface IAssessment {
  userId: Types.ObjectId;
  sessionId: Types.ObjectId;
  promptId: Types.ObjectId;
  promptKey: string;
  level: "A0" | "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  durationSeconds: number;
  timeLimitSeconds?: number;
  scores: {
    fluency: number;
    accuracy: number;
    clarity: number;
    overall: number;
  };
  strengths: string[];
  weaknesses: string[];
  flaggedExamples: {
    excerpt: string;
    issueTag: string;
    suggestion: string;
  }[];
  createdAt: Date;
}

export interface IAssessmentDoc extends IAssessment, Document {}

const AssessmentSchema = new Schema<IAssessment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: "VoiceSession", required: true },
    promptId: { type: Schema.Types.ObjectId, ref: "AssessmentPrompt", required: true },
    promptKey: { type: String, required: true },
    level: { type: String, enum: ["A0", "A1", "A2", "B1", "B2", "C1", "C2"], required: true },
    durationSeconds: { type: Number, required: true },
    timeLimitSeconds: { type: Number },
    scores: {
      fluency: { type: Number, required: true, min: 0, max: 10 },
      accuracy: { type: Number, required: true, min: 0, max: 10 },
      clarity: { type: Number, required: true, min: 0, max: 10 },
      overall: { type: Number, required: true, min: 0, max: 10 },
    },
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    flaggedExamples: [
      {
        excerpt: { type: String, required: true },
        issueTag: { type: String, required: true },
        suggestion: { type: String, required: true },
      },
    ],
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AssessmentPrompt = models?.AssessmentPrompt || model<IAssessmentPrompt>("AssessmentPrompt", AssessmentPromptSchema);
export const Assessment = models?.Assessment || model<IAssessment>("Assessment", AssessmentSchema);
