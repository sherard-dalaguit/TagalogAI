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
const taglishModeInstructions: Record<string, string> = {
  enabled: `
    # Taglish Mode: Enabled
    The student uses Taglish (Tagalog + English mixing) intentionally.
    - Do NOT flag English words as errors unless they block Tagalog flow or reveal the student is avoiding a Tagalog word they should know.
    - Evaluate them on their Tagalog structure, particles, verb aspects, and grammar — not on the ratio of English.
    - In improvedPhrases, suggest natural Taglish alternatives, not pure Tagalog rewrites.
    - In nextPractice drills, frame examples in Taglish as appropriate.
  `,
  disabled: `
    # Taglish Mode: Disabled
    The student is practicing full Tagalog.
    - Gently flag over-reliance on English fillers and suggest natural Tagalog alternatives where they exist and are learner-appropriate.
    - Prioritize helping them build Tagalog vocabulary to replace common English substitutes.
  `,
};

const preferredToneInstructions: Record<string, string> = {
  casual: `
    # Feedback Tone: Casual
    Write feedback in a friendly, relaxed tone — like a language-savvy friend texting them notes. Keep it conversational and warm.
  `,
  polite: `
    # Feedback Tone: Polite
    Write feedback in a respectful, measured tone. Be encouraging but formal. Avoid slang in the feedback prose itself.
  `,
  playful: `
    # Feedback Tone: Playful
    Write feedback with energy and humor. Use light Tagalog expressions in the feedback text where natural (e.g., "Ay nako!", "Galing!"). Make it fun and motivating.
  `,
  coach: `
    # Feedback Tone: Coach
    Write feedback like a structured coach. Be direct, goal-oriented, and action-focused. Prioritize clarity over warmth. Use clear targets and concise phrasing.
  `,
};

const tagalogFeedbackStyleInstructions: Record<string, string> = {
  natural: `
    # Filipino Speech Style: Natural
    You are a Filipino conversation coach focused on natural, real-life Tagalog used in the Philippines.
    - Prioritize conversational naturalness over textbook correctness.
    - If a sentence is grammatically correct but sounds unnatural or textbooky, flag it clearly and suggest a more commonly used phrasing.
    - Prefer concise, direct phrasing for everyday scenarios (ordering food, buying items, requesting service).
    - Recognize that politeness in Filipino comes from tone and particles like "po/opo", not from indirect structures like "Puwede po ba akong...". In transactional contexts, prefer "Pa-[verb] po ng..." or simply "[Item] po."
    - Avoid forcing formal or textbook phrasing unless the scenario specifically requires formality.
    - In improvedPhrases, explicitly state whether the original is natural, understandable but textbooky, or unnatural — then suggest a more natural version.
    - Example: User says "Puwede po ba akong umorder ng Chickenjoy?" → Note it is understandable and polite but textbooky. Suggest: "Pa-order po ng Chickenjoy" or "Isang Chickenjoy po."
  `,
  balanced: `
    # Filipino Speech Style: Balanced
    Evaluate both textbook correctness and conversational naturalness.
    - Note if a phrase is grammatically correct and complete.
    - Also note if it sounds natural/common in everyday Filipino speech.
    - If the phrase is correct but sounds formal or textbooky, acknowledge both and suggest a more natural alternative alongside the textbook version.
    - Do not over-correct into deep native slang — keep alternatives learner-appropriate.
  `,
  formal: `
    # Filipino Speech Style: Formal
    Prioritize grammatically complete, polite, and formal Tagalog phrasing.
    - Favor complete sentence structures and proper use of "po/opo" in all positions.
    - Do not push conversational shorthand (e.g., "Pa-order po") over complete structures (e.g., "Puwede po bang umorder...").
    - This style is appropriate for professional or formal settings.
  `,
};

const correctionIntensityInstructions: Record<string, string> = {
  minimal: `
    # Correction Intensity: Minimal
    The student prefers light feedback. Be encouraging and focus only on the 1–2 most impactful patterns.
    - Keep topRecurringMistakes to a maximum of 2 items.
    - Keep improvedPhrases to 3–4 items, choosing only the most important rewrites.
    - Frame every note positively. Lead with what they did well.
    - Skip minor one-off nitpicks entirely.
  `,
  moderate: `
    # Correction Intensity: Moderate
    Use the default balanced approach described above. Cover all relevant patterns without overwhelming.
  `,
  aggressive: `
    # Correction Intensity: Aggressive
    The student wants thorough, direct feedback. Do not soften corrections.
    - Return the maximum allowed items for topRecurringMistakes (5) and improvedPhrases (8).
    - Call out every notable pattern, including minor issues like particle placement and naturalness.
    - Be direct and specific. The student wants to be pushed.
    - Still base everything on the transcript — do not invent errors.
  `,
};

function buildScenarioPromptBlock(ctx: { title: string; aiRole: string; stages?: { label: string; goal: string }[] } | null | undefined): string {
  if (!ctx) return "";
  const stagesBlock = ctx.stages?.length
    ? `\n    The scenario had these expected stages:\n${ctx.stages.map((s, i) => `      ${i + 1}. ${s.label}: ${s.goal}`).join("\n")}`
    : "";
  return `
    # Roleplay Context
    This was a Scenario Roleplay session: "${ctx.title}".
    The AI played the role of: ${ctx.aiRole}.
    The user was practicing a real-life Filipino interaction end-to-end.
    The FULL conversation (both speakers) is provided above the user-only lines so you can evaluate scenario flow.${stagesBlock}

    Adjust your feedback to reflect this:
    - In highlights: explicitly state which stages the user completed and how naturally they handled them. If they missed or skipped a stage, note it.
    - In fluencyNotes: comment on scenario-specific vocabulary — did they use the right words for this context (e.g., ordering terms, direction vocab)?
    - In nextPractice: suggest drills directly tied to the scenario type and any stages the user struggled with.
    - Base ALL claims on the conversation above. Do NOT invent errors or completions not in the transcript.
  `;
}

export async function runAIReview(
  userId: string,
  sessionId: string,
  transcript: ITranscriptMessage[],
  correctionIntensity: "minimal" | "moderate" | "aggressive" = "moderate",
  taglishMode: boolean = false,
  preferredTone: "casual" | "polite" | "playful" | "coach" = "casual",
  scenarioContext?: { id: string; title: string; aiRole: string; stages?: { label: string; goal: string }[] } | null,
  tagalogFeedbackStyle: "natural" | "balanced" | "formal" = "natural"
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
    5) Naturalness: literal translations from English, awkward word order, overly formal or textbooky phrasing. In everyday transactional contexts (ordering, buying, requesting), prefer direct conversational phrasing over indirect question structures.
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

    ${correctionIntensityInstructions[correctionIntensity] ?? correctionIntensityInstructions.moderate}

    ${taglishModeInstructions[taglishMode ? "enabled" : "disabled"]}

    ${preferredToneInstructions[preferredTone] ?? preferredToneInstructions.casual}

    ${tagalogFeedbackStyleInstructions[tagalogFeedbackStyle] ?? tagalogFeedbackStyleInstructions.natural}

    ${buildScenarioPromptBlock(scenarioContext)}
  `;

  const fullConversation = scenarioContext
    ? transcript.map((m) => `${m.speaker === "user" ? "User" : "AI"}: ${m.text}`).join("\n")
    : null;

  const userMessage = {
    role: "user" as const,
    content: scenarioContext
      ? `Full conversation (for scenario context):\n${fullConversation}\n\n---\nUser's spoken lines only (focus grammar analysis on these):\n- ${userLines}`
      : `Analyze the following user's spoken lines from the conversation transcript:\n\n- ${userLines}`,
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
