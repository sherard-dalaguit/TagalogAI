"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Agent from "@/components/voice-agent/Agent";
import { SCENARIOS, RoleplayScenario } from "@/lib/roleplay/scenarios";

export default function PracticePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [practiceMode, setPracticeMode] = useState<"conversation" | "roleplay" | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<RoleplayScenario | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const userRes = await fetch("/api/users/me");
        const userData = await userRes.json();
        if (userData.success) {
          setUser(userData.data);
        } else {
          router.push("/log-in");
        }
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-xl font-medium animate-pulse text-[#CAC5FE]">
          Preparing your session...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] flex-col gap-4">
        <p className="text-red-400">Failed to initialize practice session.</p>
        <button
          onClick={() => window.location.reload()}
          className="w-fit bg-[#A39DFF] text-[#08090D] hover:bg-[#A39DFF]/80 rounded-full font-bold px-5 cursor-pointer min-h-10"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 relative">
      {user.preferences?.wallpaper && (
        <div
          className="fixed inset-0 z-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage: `url(${user.preferences.wallpaper})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(8px)",
          }}
        />
      )}

      <div className="flex flex-col gap-2 relative z-10">
        <h1 className="text-3xl font-bold text-white">Practice Tagalog</h1>
        <p className="text-[#9CA3AF]">
          Speak with our AI agent to improve your Tagalog skills in real-time.
        </p>
      </div>

      <div className="w-full max-w-4xl mx-auto relative z-10">
        {/* Phase 1: Mode Selection */}
        {practiceMode === null && (
          <div className="flex flex-col gap-6">
            <p className="text-zinc-400 text-sm">Choose how you want to practice today.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setPracticeMode("conversation")}
                className="text-left bg-zinc-900/50 border border-white/10 rounded-2xl p-6 hover:border-[#A39DFF]/50 cursor-pointer transition-colors"
              >
                <div className="text-2xl mb-3">💬</div>
                <h2 className="text-lg font-bold text-white mb-1">Free Conversation</h2>
                <p className="text-sm text-zinc-400">
                  Open-ended chat with the AI tutor. Practice naturally on any topic.
                </p>
              </button>

              <button
                onClick={() => setPracticeMode("roleplay")}
                className="text-left bg-zinc-900/50 border border-white/10 rounded-2xl p-6 hover:border-[#A39DFF]/50 cursor-pointer transition-colors"
              >
                <div className="text-2xl mb-3">🎭</div>
                <h2 className="text-lg font-bold text-white mb-1">Scenario Roleplay</h2>
                <p className="text-sm text-zinc-400">
                  Practice real Filipino interactions — ordering food, asking directions, and more.
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Phase 2: Scenario Grid */}
        {practiceMode === "roleplay" && !selectedScenario && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPracticeMode(null)}
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                ← Back
              </button>
              <p className="text-zinc-400 text-sm">Pick a scenario to practice.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SCENARIOS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedScenario(s)}
                  className="text-left bg-zinc-900/50 border border-white/10 rounded-2xl p-5 hover:border-[#A39DFF]/50 cursor-pointer transition-colors flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-white leading-snug">{s.title}</h3>
                    <span
                      className={`shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                        s.difficulty === "beginner"
                          ? "text-green-400 bg-green-500/10 border-green-500/20"
                          : "text-amber-400 bg-amber-500/10 border-amber-500/20"
                      }`}
                    >
                      {s.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-snug">{s.tagline}</p>
                  <p className="text-[11px] text-zinc-500 mt-auto">AI: {s.aiRole}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Phase 3: Agent */}
        {(practiceMode === "conversation" || (practiceMode === "roleplay" && selectedScenario)) && (
          <Agent user={user} practiceMode={practiceMode} scenario={selectedScenario} />
        )}
      </div>
    </div>
  );
}