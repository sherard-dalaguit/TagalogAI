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
    <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-12 max-w-5xl mx-auto">
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
                <ul className="space-y-3">
                  {feedback.topRecurringMistakes.map((m, i) => (
                    <li key={i} className="flex gap-3 text-zinc-300 text-sm leading-relaxed">
                      <span className="text-amber-500 mt-1">•</span>
                      {m}
                    </li>
                  ))}
                </ul>
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
                        <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">Try this instead</p>
                        <p className="text-blue-100 font-medium text-lg">"{p.improved}"</p>
                      </div>
                      <p className="text-sm text-zinc-500 bg-zinc-950/50 p-3 rounded-lg">
                        {p.explanation}
                      </p>
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
