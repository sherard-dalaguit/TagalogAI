"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { IVoiceSessionDoc } from "@/database/voice-session.model";
import { IFeedbackSummaryDoc } from "@/database/feedback-summary.model";
import { Bookmark, BookmarkCheck, Pencil, Trash2 } from "lucide-react";

function formatDuration(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  if (mins === 0) return `${secs}s`;
  return secs === 0 ? `${mins}m` : `${mins}m ${secs}s`;
}

export default function SessionSummaryPage() {
  const { id } = useParams();
  const router = useRouter();
  const [session, setSession] = useState<IVoiceSessionDoc | null>(null);
  const [feedback, setFeedback] = useState<IFeedbackSummaryDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFavorited, setIsFavorited] = useState(false);
  const [title, setTitle] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      setLoading(true);
      try {
        const [sessionRes, feedbackRes] = await Promise.all([
          fetch(`/api/sessions/${id}`),
          fetch(`/api/feedback/${id}`)
        ]);

        const sessionData = await sessionRes.json();
        const feedbackData = await feedbackRes.json();

        if (sessionData.success) {
          setSession(sessionData.data);
          setIsFavorited(!!sessionData.data.isFavorited);
          setTitle(sessionData.data.title ?? "");
        } else {
          setError("Failed to load session details");
        }

        if (feedbackData.success) {
          setFeedback(feedbackData.data);
        } else {
          // It's possible feedback is still being processed or failed
          console.warn("Feedback not found or failed to load");
        }
      } catch (err) {
        console.error("Error fetching summary data:", err);
        setError("An error occurred while loading the summary");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  const saveTitle = async (value: string) => {
    const trimmed = value.trim();
    setTitle(trimmed);
    setIsEditingTitle(false);
    await fetch(`/api/sessions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: trimmed }),
    });
  };

  const deleteSession = async () => {
    await fetch(`/api/sessions/${id}`, { method: "DELETE" });
    router.push("/history");
  };

  const toggleFavorite = async () => {
    const next = !isFavorited;
    setIsFavorited(next);
    try {
      await fetch(`/api/sessions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorited: next }),
      });
    } catch {
      setIsFavorited(!next);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-xl font-medium animate-pulse">Loading summary...</div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4">
        <div className="text-red-400 mb-4">{error || "Session not found"}</div>
        <button 
          onClick={() => router.push("/practice")}
          className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded transition-colors"
        >
          Back to Practice
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-12 mx-auto">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="min-w-0">
          {isEditingTitle ? (
            <input
              autoFocus
              className="text-xl font-bold md:text-3xl bg-transparent border-b border-indigo-500 outline-none text-white w-full max-w-xs md:max-w-md"
              defaultValue={title}
              placeholder="Session Summary"
              onBlur={(e) => saveTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
                if (e.key === "Escape") { setIsEditingTitle(false); }
              }}
            />
          ) : (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="group flex items-center gap-2 text-left"
            >
              <h1 className="text-xl font-bold md:text-3xl truncate">
                {title || "Session Summary"}
              </h1>
              <Pencil className="h-4 w-4 shrink-0 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
            </button>
          )}
          <p className="mt-0.5 text-xs text-zinc-500 md:text-sm flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
            {session.scenario && (
              <span className="capitalize">{session.scenario.replace(/_/g, " ")}</span>
            )}
            {session.scenario && <span>·</span>}
            <span>{new Date(session.createdAt as unknown as string).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
            {session.durationSeconds != null && session.durationSeconds > 0 && (
              <>
                <span>·</span>
                <span>{formatDuration(session.durationSeconds)}</span>
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={toggleFavorite}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full font-medium border transition-colors border-white/10 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
            aria-label={isFavorited ? "Remove from saved" : "Save session"}
          >
            {isFavorited ? (
              <BookmarkCheck className="h-4 w-4 text-indigo-400" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">{isFavorited ? "Saved" : "Save"}</span>
          </button>
          {isConfirmingDelete ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={deleteSession}
                className="px-3 py-1.5 text-sm rounded-full font-medium border border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
              >
                Delete?
              </button>
              <button
                onClick={() => setIsConfirmingDelete(false)}
                className="px-2 py-1.5 text-sm rounded-full text-zinc-500 hover:text-white hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsConfirmingDelete(true)}
              className="p-2 rounded-full text-zinc-600 hover:text-red-400 hover:bg-white/5 transition-colors"
              aria-label="Delete session"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => router.push("/practice")}
            className="bg-indigo-600 hover:bg-indigo-700 px-4 py-1.5 text-sm rounded-full font-medium transition-colors"
          >
            + New Session
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Feedback */}
        <div className="lg:col-span-2 space-y-8">
          {feedback ? (
            <>
              {/* Overview Section */}
              <section className="bg-linear-to-br from-indigo-900/20 to-zinc-900 border border-indigo-500/20 rounded-2xl p-5">
                {/* Level + Confidence row */}
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-1">Current Assessment</p>
                    <h2 className="text-2xl font-black text-white leading-tight">{feedback.overview.estimatedLevel}</h2>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Confidence</p>
                    <p className="text-2xl font-mono font-bold text-zinc-200">{Math.round(feedback.overview.confidence * 100)}%</p>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px w-full bg-indigo-500/15 mb-4" />

                {/* Fluency Notes */}
                <div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Fluency Notes</p>
                  <ul className="space-y-2">
                    {feedback.overview.fluencyNotes.map((note, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-zinc-300 leading-snug">
                        <span className="mt-1.5 shrink-0 h-1.5 w-1.5 rounded-full bg-indigo-400/60" />
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* Highlights */}
              <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="text-green-400">✨</span> Conversation Highlights
                </h2>
                <ul className="space-y-3">
                  {feedback.highlights.map((h, i) => (
                    <li key={i} className="flex gap-3 text-zinc-300 text-sm leading-relaxed">
                      <span className="text-green-500 mt-1">•</span>
                      {h}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Recurring Mistakes */}
              <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span>🎯</span> Areas for Improvement
                </h2>
                <div className="space-y-3">
                  {feedback.topRecurringMistakes.map((m, i) => (
                    <div key={i} className="rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950/40">
                      {/* Card header */}
                      <div className="flex items-center gap-2.5 px-4 pt-4 pb-3">
                        <span className="shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-bold">
                          {i + 1}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                          {m.category}
                        </span>
                      </div>

                      {/* Mistake + why */}
                      <div className="px-4 pb-3">
                        <p className="text-base font-semibold text-white leading-snug mb-2">{m.mistake}</p>
                        <p className="text-sm text-zinc-400 leading-relaxed">{m.why}</p>
                      </div>

                      {/* Recommended fix */}
                      <div className="mx-4 mb-4 bg-zinc-900 rounded-xl p-3 border border-zinc-800">
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Recommended Fix</p>
                        <p className="text-sm text-zinc-300 italic leading-relaxed">{m.exampleFix}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Improved Phrases */}
              <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <span className="text-blue-400">💡</span> Phrase Breakdown
                </h2>
                <div className="space-y-6">
                  {feedback.improvedPhrases.map((p, i) => (
                    <div key={i} className="border-l-2 border-zinc-800 pl-4 space-y-3">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">You said</p>
                        <p className="text-zinc-400 italic">"{p.original}"</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">Try this instead</p>
                          <span className="text-[10px] text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700">
                            {p.category}
                          </span>
                        </div>
                        <p className="text-blue-100 font-medium text-lg">"{p.improved}"</p>
                      </div>
                      <p className="text-sm text-zinc-500 bg-zinc-950/50 p-3 rounded-lg">
                        {p.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Next Practice Section */}
              <section className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-6">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-indigo-300">
                  <span>🚀</span> Your Next Steps
                </h2>
                <div className="flex flex-col gap-4">
                  {feedback.nextPractice.map((np, i) => (
                    <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                      {/* Header row */}
                      <div className="flex items-start gap-3 p-4 pb-3">
                        <span className="mt-0.5 shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-bold">
                          {i + 1}
                        </span>
                        <p className="text-sm font-semibold text-indigo-300 leading-snug">{np.goal}</p>
                      </div>

                      {/* Drill */}
                      <div className="mx-4 mb-3 bg-zinc-950/60 rounded-xl px-4 py-3">
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Drill</p>
                        <p className="text-sm text-zinc-300 leading-relaxed">{np.drill}</p>
                      </div>

                      {/* Examples */}
                      <div className="px-4 pb-4 space-y-2">
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Examples</p>
                        {np.examples.map((ex, j) => (
                          <div key={j} className="flex items-start gap-2">
                            <span className="mt-1.5 shrink-0 h-1.5 w-1.5 rounded-full bg-indigo-500/50" />
                            <p className="text-sm text-zinc-400 italic leading-snug">"{ex}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
              <p className="text-zinc-500">Feedback is still being generated for this session...</p>
            </div>
          )}
        </div>

        {/* Right Column: Transcript */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 px-2">
            <span className="text-purple-400">💬</span> Transcript
          </h2>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 max-h-200 overflow-y-auto space-y-4">
            {session.transcript.length === 0 ? (
              <p className="text-zinc-500 text-sm text-center py-4">No transcript available.</p>
            ) : (
              session.transcript.map((msg, i) => (
                <div key={msg.order ?? i} className={`flex flex-col ${msg.speaker === 'user' ? 'items-start' : 'items-end'}`}>
                  <span className={`text-[10px] font-bold uppercase mb-1 px-2 ${
                    msg.speaker === 'user' ? 'text-blue-400' : 'text-purple-400'
                  }`}>
                    {msg.speaker}
                  </span>
                  <div className={`max-w-[90%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.speaker === 'user' 
                      ? 'bg-blue-600/10 border border-blue-500/20 text-blue-50' 
                      : 'bg-purple-600/10 border border-purple-500/20 text-purple-50'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
