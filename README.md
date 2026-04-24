# TagalogAI

> A real-time Tagalog voice tutoring app powered by AI — speak with an AI tutor, get structured feedback on your Tagalog, and track your progress over time.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb)
![NextAuth](https://img.shields.io/badge/NextAuth-v5-purple)
![Vapi](https://img.shields.io/badge/Vapi.ai-Voice-orange)
![OpenAI](https://img.shields.io/badge/OpenAI-gpt--5-412991?logo=openai)

---

## Overview

Learning Tagalog through apps usually means flashcards and grammar drills — not actual conversation. TagalogAI lets you practice speaking with an AI tutor in real time via voice, then immediately see structured, personalized feedback: your estimated proficiency level, recurring mistakes with explanations, suggested phrase improvements, and targeted drills for your next session.

Users can choose between a free-form conversation mode or one of ten guided roleplay scenarios (ordering at Jollibee, asking for directions, talking to a Grab driver, etc.). Tutor behavior is fully customizable — correction intensity, Taglish tolerance, AI tone, and feedback formality are all configurable per user. Each session is stored and reviewable, with a 10-minute daily voice limit to keep practice focused.

---

## Features

### Practice Modes
- **Free Conversation** — open-ended chat with the AI tutor on any topic
- **Scenario Roleplay** — ten guided Filipino-life scenarios at beginner and intermediate difficulty, each with a defined AI role and conversation stages

### AI Feedback (post-session)
- Estimated proficiency level (Beginner → Advanced) with a confidence score
- Fluency notes written in natural Tagalog/Taglish
- Top recurring mistakes — categorized (particles, grammar, vocab, pronouns), with a Taglish explanation and a before/after fix
- Phrase breakdown — direct quotes from the transcript with improved alternatives and explanations
- Next-practice drills — actionable goals with 3–5 example sentences

### Personalization
- **Correction Intensity** — minimal, moderate, or aggressive (controls how many issues are surfaced)
- **Taglish Mode** — flag or allow English mixing in feedback
- **Preferred AI Tone** — casual, polite, playful, or coach
- **Tagalog Feedback Style** — natural, balanced, or formal
- **Tutor Mode** — none, implicit (subtle hints), or inline (real-time corrections)
- **Wallpaper** — choose from 12 Filipino location backgrounds for the practice screen

### Session Tracking
- Editable session titles, favorite/delete controls
- Full conversation transcript (color-coded by speaker) alongside the feedback view
- Dashboard showing total sessions, last practiced date, and daily usage stats
- 10-minute daily voice limit enforced client- and server-side

### Authentication
- Google and GitHub OAuth sign-in with account linking
- Session managed by NextAuth v5

---

## How It Works

### Voice call flow

TagalogAI uses the **Vapi.ai** web SDK for real-time voice — no WebRTC plumbing required on the client side.

1. User selects a practice mode and clicks **Call**
2. `POST /api/sessions` creates a `VoiceSession` document in MongoDB and returns the session ID
3. `vapi.start()` launches the call, injecting the user's current preference variables (`taglishMode`, `preferredTone`, `tutorMode`, and optional `roleplayContext`) into the assistant at call time
4. During the call, `Agent.tsx` listens to Vapi SDK events (`message`, `speech-start`, `speech-end`, `call-end`) and merges adjacent same-speaker transcript segments within a 1.8-second window
5. A 15-second interval sync patches `durationSeconds` to the server; a 1-second interval enforces the daily limit and auto-disconnects when it is reached
6. On call end, a transcript editor modal lets the user review and optionally correct the transcript before submitting

### AI feedback generation

After the user confirms the transcript:

1. `PATCH /api/sessions/[id]` saves the final transcript, `endedAt`, and `durationSeconds`
2. `POST /api/feedback/[id]` calls `runAIReview()` in `lib/server/runAIReview.ts`
3. `runAIReview()` extracts only the user's spoken lines and sends them to **OpenAI gpt-5** with `zodTextFormat` structured output
4. The system prompt is assembled dynamically from five blocks:
   - Ground rules (evidence-based, no invented content)
   - Tagalog-specific analysis focus (particles, aspect markers, pronouns, naturalness)
   - `correctionIntensity` instructions (minimal: 1–2 items; aggressive: max items)
   - `taglishMode`, `preferredTone`, and `tagalogFeedbackStyle` modifier blocks
   - Optional scenario context (if the session was a roleplay)
5. The Zod-validated response maps directly to a `FeedbackSummary` document and is saved to MongoDB
6. The user is redirected to `/sessions/[id]` to view their feedback

### Request flow

```
Browser → Next.js Server Component / API Route
  → lib/server/*.ts       (business logic, OpenAI calls, usage checks)
  → Mongoose models       (MongoDB Atlas)
  → Response to client
```

Client-initiated requests (settings updates, session patches) go through Next.js API routes directly from `Agent.tsx` or settings page components.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router) + React 19 |
| Styling | Tailwind CSS v4, Radix UI primitives, shadcn-style components |
| Animations | Motion (Framer Motion) |
| Backend | Next.js API Routes (TypeScript) |
| Database | MongoDB Atlas + Mongoose |
| Auth | NextAuth v5 beta — Google, GitHub |
| Voice | Vapi.ai Web SDK |
| AI Feedback | OpenAI gpt-5 with Zod structured output |
| Forms | React Hook Form + Zod |
| Deployment | Vercel |

---

## Project Structure

```
tagalogai/
├── app/
│   ├── page.tsx                     # Public landing page (hero, features, FAQ)
│   ├── layout.tsx                   # Root layout (fonts, ThemeProvider, metadata)
│   ├── (auth)/log-in/               # OAuth sign-in page
│   └── (root)/                      # Protected shell — auth guard + Navbar
│       ├── dashboard/               # Greeting, practice CTA, stats, recent sessions
│       ├── practice/                # Mode selector → scenario picker → voice agent
│       ├── sessions/[id]/           # Post-session feedback + transcript view
│       ├── history/                 # Full session list
│       └── settings/                # User preferences and wallpaper
│
├── app/api/
│   ├── auth/[...nextauth]/          # NextAuth handler
│   ├── auth/signin-with-oauth/      # Upserts User + Account on first sign-in
│   ├── accounts/provider/           # Resolves providerAccountId → internal userId
│   ├── sessions/                    # GET list, POST create
│   ├── sessions/[id]/               # GET, PATCH (transcript + duration), DELETE
│   ├── feedback/[id]/               # GET, POST (triggers runAIReview)
│   ├── users/me/                    # GET current user, PATCH preferences
│   └── user/daily-usage/            # GET today's consumed voice seconds
│
├── components/
│   ├── ui/                          # Shared primitives (Button, Card)
│   ├── navigation/                  # Navbar, UserMenu dropdown
│   ├── voice-agent/
│   │   ├── Agent.tsx                # Core call UI — state machine, Vapi events, sync
│   │   └── TranscriptEditModal.tsx  # Pre-feedback transcript review modal
│   ├── log-in.tsx                   # OAuth sign-in UI
│   └── theme-provider.tsx           # next-themes dark mode wrapper
│
├── database/
│   ├── user.model.ts                # User + preferences schema
│   ├── account.model.ts             # OAuth provider link
│   ├── voice-session.model.ts       # Session + transcript storage
│   ├── feedback-summary.model.ts    # AI-generated feedback (1:1 with session)
│   └── assessment.model.ts          # Proficiency assessment (defined, not yet live)
│
├── lib/
│   ├── mongoose.ts                  # Cached MongoDB connection
│   ├── vapi.sdk.ts                  # Vapi singleton instance
│   ├── server/
│   │   ├── openai.ts                # OpenAI client init
│   │   ├── runAIReview.ts           # Feedback generation — prompt assembly + gpt-5 call
│   │   └── usage.ts                 # Daily limit logic (DAILY_LIMIT_SECONDS = 600)
│   └── roleplay/
│       └── scenarios.ts             # 10 scenario definitions + buildRoleplayContext()
│
├── auth.ts                          # NextAuth config (signIn, jwt, session callbacks)
└── constants/                       # Routes, app-wide enums
```

---

## Getting Started

**Prerequisites:** Node.js 20+, a MongoDB Atlas cluster, a Vapi.ai account (with a configured assistant), an OpenAI API key, and Google and/or GitHub OAuth apps.

### 1. Clone and install

```bash
git clone https://github.com/your-username/tagalogai.git
cd tagalogai
npm install
```

### 2. Environment variables

Create `.env.local` in the `tagalogai/` directory:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000

MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/TagalogAI

AUTH_SECRET=<random string>
AUTH_GOOGLE_ID=<google oauth client id>
AUTH_GOOGLE_SECRET=<google oauth client secret>
AUTH_GITHUB_ID=<github oauth app client id>
AUTH_GITHUB_SECRET=<github oauth app client secret>

NEXT_PUBLIC_VAPI_WEB_TOKEN=<vapi web token>
NEXT_PUBLIC_VAPI_ASSISTANT_ID=<vapi assistant id>

OPENAI_API_KEY=<openai api key>
```

### 3. Run the dev server

```bash
npm run dev   # http://localhost:3000
```

### Other commands

```bash
npm run build   # production build
npm run lint    # ESLint check
```

---

## Database Schema

| Collection | Key Fields |
|-----------|-----------|
| `users` | `name`, `email`, `image`, `preferences` (correctionIntensity, taglishMode, preferredTone, tutorMode, tagalogFeedbackStyle, wallpaper) |
| `accounts` | `userId`, `provider`, `providerAccountId`, `name`, `image` |
| `voicesessions` | `userId`, `mode`, `scenario`, `transcript[]`, `durationSeconds`, `startedAt`, `endedAt`, `isFavorited`, `feedbackSummaryId` |
| `feedbacksummaries` | `userId`, `sessionId`, `overview` (estimatedLevel, confidence, fluencyNotes), `highlights`, `topRecurringMistakes[]`, `improvedPhrases[]`, `nextPractice[]` |
| `assessments` | `userId`, `sessionId`, `promptId`, `scores` (fluency, accuracy, clarity, overall), `strengths`, `weaknesses`, `flaggedExamples[]` |

### User preferences

| Preference | Options | Default |
|-----------|---------|---------|
| `correctionIntensity` | minimal, moderate, aggressive | moderate |
| `taglishMode` | true / false | false |
| `preferredTone` | casual, polite, playful, coach | casual |
| `tutorMode` | none, implicit, inline | none |
| `tagalogFeedbackStyle` | natural, balanced, formal | natural |

### Roleplay scenarios

Ten built-in scenarios covering everyday Filipino life:

| Scenario | Difficulty |
|---------|-----------|
| Ordering at Jollibee | Beginner |
| Talking to a Grab driver | Beginner |
| Ordering at a café | Beginner |
| Asking for directions | Beginner |
| Getting help in a store | Beginner |
| Meeting a relative | Beginner |
| Meeting a new friend | Beginner |
| Buying clothes | Intermediate |
| Hotel check-in | Intermediate |
| Serving as a restaurant server | Intermediate |

---

## Known Limitations

- **Daily voice limit** — users are capped at 10 minutes of voice practice per day; the limit resets at midnight UTC
- **No real-time feedback** — AI feedback is generated after the call ends, not during it
- **Vapi dependency** — call quality and latency depend on Vapi.ai infrastructure; the assistant must be pre-configured in the Vapi dashboard before the app can start calls
- **Assessment flow incomplete** — the `Assessment` and `AssessmentPrompt` models are defined but not yet wired into the main user flow
- **No test suite** — server actions, API routes, and the feedback pipeline have no automated tests