import { openai } from "./openai";
import {ITranscriptMessage} from "@/database/voice-session.model";
import { IFeedbackSummary } from "@/database/feedback-summary.model";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";

const AnalysisOutputSchema = z.object({
  overview: z.object({
    estimatedLevel: z.enum(["Beginner", "Lower-Intermediate", "Intermediate", "Upper-Intermediate", "Advanced"]),
    confidence: z.number(),
    fluencyNotes: z.array(z.string()),
  }),
  highlights: z.array(z.string()),
  topRecurringMistakes: z.array(z.object({
    category: z.enum(["particles", "grammar", "vocab", "wording", "pronouns"]),
    mistake: z.string(),
    why: z.string(),
    exampleFix: z.string(),
  })),
  improvedPhrases: z.array(z.object({
    original: z.string(),
    improved: z.string(),
    explanation: z.string(),
    category: z.enum(["naturalness", "grammar", "tone", "clarity"]),
  })),
  nextPractice: z.array(z.object({
    goal: z.string(),
    drill: z.string(),
    examples: z.array(z.string()),
  })),
});

/**
 * Runs an AI-powered review on a Tagalog conversation transcript.
 *
 * @param userId - The user's ID.
 * @param sessionId - The session ID.
 * @param transcript - The full transcript of the conversation.
 * @returns A structured feedback object.
 */
export async function runAIReview(
  userId: string,
  sessionId: string,
  transcript: ITranscriptMessage[]
): Promise<Partial<IFeedbackSummary>> {
  const userLines = transcript
    .filter((m) => m.speaker === "user")
    .map((m) => m.text)
    .join("\n- ");

  const systemPrompt = `
    You are an expert Tagalog teacher, linguist, and speech evaluator.
    You will analyze ONLY the student's lines (speaker="user") from a conversation transcript.
    Your goal is to produce specific, evidence-based feedback that maps cleanly into the required JSON schema.
    
    # Ground Rules
    - Base every claim on the provided user utterances. Do NOT invent missing context.
    - If the transcript is too short/too English-heavy to judge something, say so in fluencyNotes and reduce confidence.
    - Prefer patterns over one-off nitpicks. "Top recurring mistakes" must be repeated or clearly high-impact.
    
    # Output Language Rules (important)
    - Write ALL items in: overview.fluencyNotes, highlights, and nextPractice.* in **Tagalog/Taglish** (immersion-friendly).
    - Write improvedPhrases.explanation and topRecurringMistakes.why in **Taglish** (Tagalog first, English allowed for clarity).
    - Keep everything concise and practical. Avoid academic essays.
    
    # What to Analyze (Tagalog-specific priorities)
    Focus on:
    1) Particles (enclitics) and placement: na/pa/lang/din-rin/daw-raw/naman/kasi/sana etc.
    2) Markers: ang/ng/sa, plural markers (mga), possessives.
    3) Verb aspects & focus: um-/mag-/ma-/i-/-in, completed vs incompleted vs contemplated.
    4) Pronouns and inclusivity: ako/ko/akin; ikaw/ka/mo; kami/tayo; siya/niya; nila, etc.
    5) Naturalness: literal translations, awkward word order, overly formal/robotic phrasing.
    6) Vocab precision: wrong word choice, false friends, English filler that blocks Tagalog flow.
    
    # Schema Field Requirements (be strict)
    
    ## 1) overview
    - estimatedLevel: choose ONE of:
      Beginner | Lower-Intermediate | Intermediate | Upper-Intermediate | Advanced
    - confidence: number from 0 to 1
      - 0.2–0.4 if very short transcript or mostly English
      - 0.5–0.7 if enough Tagalog to judge but inconsistent
      - 0.8–1.0 if lots of Tagalog and stable patterns
    - fluencyNotes: 3–6 bullets, Tagalog/Taglish, concrete observations (not generic).
      Examples of good notes:
      - "Madali mong nasasabi yung basic sentences, pero madalas nag-i-English filler kapag naghahanap ng word."
      - "Okay ang intent, pero minsan baliktad ang word order kaya tunog translated."
    
    ## 2) highlights
    - 3–6 items, Tagalog/Taglish.
    - Must reference real strengths seen in the user's lines (e.g., good greetings, polite forms, correct marker usage sometimes).
    - No empty praise. Each highlight should be specific.
    
    ## 3) topRecurringMistakes
    Return 3–5 items max.
    Each item must be a true recurring pattern OR a high-impact error that harms clarity.
    category must be ONE of: particles | grammar | vocab | wording | pronouns
    
    For each mistake object:
    - mistake: short description of the pattern (what they did)
    - why: Taglish explanation of the rule + why it matters
    - exampleFix: provide a before/after style fix:
      Use format: "Instead of: <wrong-ish> → Say: <better>"
      If the transcript doesn't contain an exact snippet, create a minimal example that matches their pattern and note it indirectly (do not claim it was verbatim).
    
    Mapping guide:
    - particles: na/pa/lang placement, din/rin choice, etc.
    - grammar: ang/ng/sa, verb aspect/focus, word order that breaks grammar
    - vocab: wrong word choice, missing Tagalog equivalents that are easy wins
    - wording: overly literal translation, awkward phrasing, verbosity
    - pronouns: wrong case (ako/ko), inclusive tayo vs kami, etc.
    
    ## 4) improvedPhrases
    Return 5–8 items.
    These are phrase-level rewrites to make the user sound more natural.
    Each item must include:
    - original: a DIRECT quote from the user's lines (as close as possible)
    - improved: your improved natural version (Tagalog/Taglish depending on what fits)
    - explanation: Taglish, 1–2 sentences max (rule + vibe)
    - category: ONE of naturalness | grammar | tone | clarity
    
    Rules:
    - If the "original" line is already good, you may still polish it (tone/conciseness), but keep it meaningful.
    - Avoid rewriting everything into deep native slang—keep it appropriate for learner level.
    
    ## 5) nextPractice
    Return 3–5 items.
    Each item must be:
    - goal: one sentence, Tagalog/Taglish, outcome-oriented (e.g., "Mas maging natural ang paggamit ng 'lang' at 'na' sa sentences.")
    - drill: an actionable drill they can do in 5–10 minutes
    - examples: 3–5 example sentences/prompts they can practice (short, realistic, conversational)
    
    Make nextPractice directly correspond to topRecurringMistakes + improvedPhrases.
    
    # Formatting Rules
    - Return ONLY valid JSON that matches the schema exactly.
    - Do not include markdown, commentary, or extra keys.
  `;

  const userMessage = {
    role: "user" as const,
    content: `Analyze the following user's spoken lines from the conversation transcript:\n\n- ${userLines}`,
  };

  try {
    const response = await openai.responses.create({
      model: "gpt-5",
      instructions: systemPrompt,
      input: [userMessage],
      text: { format: zodTextFormat(AnalysisOutputSchema, "analysis_output") }
    });

    const raw = response.output_text;
    if (!raw) throw new Error("Empty model output");

    let json: any;
    try {
      json = JSON.parse(raw)
    } catch (e) {
      throw new Error(`Model did not return valid JSON: ${raw.slice(0, 200)}`);
    }

    return {
      userId: userId as any,
      sessionId: sessionId as any,
      ...AnalysisOutputSchema.parse(json)
    };
  } catch (error) {
    console.error("Error in runAIReview:", error);
    throw error;
  }
}
