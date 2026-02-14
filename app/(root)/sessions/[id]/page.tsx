"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { IVoiceSessionDoc } from "@/database/voice-session.model";
import { IFeedbackSummaryDoc } from "@/database/feedback-summary.model";

export default function SessionSummaryPage() {
  const { id } = useParams();
  const router = useRouter();
  const [session, setSession] = useState<IVoiceSessionDoc | null>(null);
  const [feedback, setFeedback] = useState<IFeedbackSummaryDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-12 mx-auto">
      <div className="mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Session Summary</h1>
          <p className="text-zinc-400">
            {session.scenario?.replace("_", " ")} • {new Date(session.createdAt as unknown as string).toLocaleString()}
          </p>
        </div>
        <button 
          onClick={() => router.push("/practice")}
          className="bg-indigo-600 hover:bg-indigo-700 px-6 py-2 rounded-full font-medium transition-colors"
        >
          New Session
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Feedback */}
        <div className="lg:col-span-2 space-y-8">
          {feedback ? (
            <>
              {/* Overview Section */}
              <section className="bg-gradient-to-br from-indigo-900/20 to-zinc-900 border border-indigo-500/20 rounded-2xl p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em] mb-1">Current Assessment</p>
                    <h2 className="text-3xl font-black text-white">{feedback.overview.estimatedLevel}</h2>
                  </div>
                  <div className="flex gap-8">
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Confidence</p>
                      <p className="text-xl font-mono text-zinc-200">{Math.round(feedback.overview.confidence * 100)}%</p>
                    </div>
                    <div className="h-10 w-px bg-zinc-800 hidden md:block" />
                    <div>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Fluency Notes</p>
                      <div className="flex flex-wrap gap-2">
                        {feedback.overview.fluencyNotes.map((note, i) => (
                          <span key={i} className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full border border-zinc-700">
                            {note}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
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
              <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="text-amber-400">🎯</span> Areas for Improvement
                </h2>
                <div className="space-y-4">
                  {feedback.topRecurringMistakes.map((m, i) => (
                    <div key={i} className="bg-zinc-950/30 rounded-xl p-4 border border-zinc-800/50">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">
                          {m.category}
                        </span>
                      </div>
                      <p className="text-zinc-200 font-medium mb-1">{m.mistake}</p>
                      <p className="text-sm text-zinc-500 mb-3">{m.why}</p>
                      <div className="bg-zinc-900/80 rounded-lg p-3 border border-zinc-800">
                        <p className="text-[10px] font-bold text-zinc-600 uppercase mb-1">Recommended Fix</p>
                        <p className="text-zinc-300 italic">{m.exampleFix}</p>
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
                  <span className="text-indigo-400">🚀</span> Your Next Steps
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {feedback.nextPractice.map((np, i) => (
                    <div key={i} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl space-y-3">
                      <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{np.goal}</p>
                      <p className="text-sm text-zinc-300">{np.drill}</p>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {np.examples.map((ex, j) => (
                          <span key={j} className="text-[10px] bg-zinc-950 text-zinc-500 border border-zinc-800 px-2 py-1 rounded italic">
                            "{ex}"
                          </span>
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
