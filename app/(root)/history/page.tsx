"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mic, ChevronLeft, Bookmark, BookmarkCheck, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceSession {
  _id: string;
  createdAt: string;
  title?: string;
  mode?: string;
  scenario?: string;
  isFavorited?: boolean;
  durationSeconds?: number;
}

function formatDisplayName(str: string | undefined) {
  if (!str) return "General Session";
  return str.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function formatFullDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatDuration(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  if (mins === 0) return `${secs}s`;
  return secs === 0 ? `${mins}m` : `${mins}m ${secs}s`;
}

type Group = { label: string; sessions: VoiceSession[] };

function groupSessions(sessions: VoiceSession[]): Group[] {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday.getTime() - 86400000);
  const startOfThisWeek = new Date(startOfToday.getTime() - startOfToday.getDay() * 86400000);

  const buckets: Record<string, VoiceSession[]> = {};

  for (const s of sessions) {
    const d = new Date(s.createdAt);
    let label: string;

    if (d >= startOfToday) {
      label = "Today";
    } else if (d >= startOfYesterday) {
      label = "Yesterday";
    } else if (d >= startOfThisWeek) {
      label = "This Week";
    } else {
      label = d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
    }

    if (!buckets[label]) buckets[label] = [];
    buckets[label].push(s);
  }

  const priority = ["Today", "Yesterday", "This Week"];
  return [
    ...priority.filter((l) => buckets[l]).map((l) => ({ label: l, sessions: buckets[l] })),
    ...Object.entries(buckets)
      .filter(([l]) => !priority.includes(l))
      .sort((a, b) => new Date(b[1][0].createdAt).getTime() - new Date(a[1][0].createdAt).getTime())
      .map(([label, sessions]) => ({ label, sessions })),
  ];
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<VoiceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "saved">("all");
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/sessions")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setSessions(
            [...data.data].sort(
              (a: VoiceSession, b: VoiceSession) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
          );
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const deleteSession = async (id: string) => {
    setSessions((prev) => prev.filter((s) => s._id !== id));
    setConfirmingDelete(null);
    await fetch(`/api/sessions/${id}`, { method: "DELETE" });
  };

  const toggleFavorite = async (id: string, current: boolean | undefined) => {
    const next = !current;
    // Optimistic update
    setSessions((prev) =>
      prev.map((s) => (s._id === id ? { ...s, isFavorited: next } : s))
    );
    try {
      await fetch(`/api/sessions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorited: next }),
      });
    } catch {
      // Revert on failure
      setSessions((prev) =>
        prev.map((s) => (s._id === id ? { ...s, isFavorited: current } : s))
      );
    }
  };

  const filteredSessions = filter === "saved" ? sessions.filter((s) => s.isFavorited) : sessions;
  const groups = groupSessions(filteredSessions);
  const savedCount = sessions.filter((s) => s.isFavorited).length;

  return (
    <div className="max-w-2xl mx-auto px-4 pb-16 pt-2 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="rounded-full text-[#9CA3AF] hover:text-white hover:bg-white/5">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Session History</h1>
          {!loading && (
            <p className="text-sm text-[#9CA3AF]">
              {sessions.length} {sessions.length === 1 ? "session" : "sessions"} total
            </p>
          )}
        </div>
      </div>

      {/* Filter toggle */}
      {!loading && sessions.length > 0 && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
              filter === "all"
                ? "bg-[#A39DFF]/20 text-[#C8C7FF] border border-[#A39DFF]/30"
                : "text-[#9CA3AF] hover:text-white border border-transparent"
            )}
          >
            All
          </button>
          <button
            onClick={() => setFilter("saved")}
            className={cn(
              "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
              filter === "saved"
                ? "bg-[#A39DFF]/20 text-[#C8C7FF] border border-[#A39DFF]/30"
                : "text-[#9CA3AF] hover:text-white border border-transparent"
            )}
          >
            <BookmarkCheck className="h-3.5 w-3.5" />
            Saved
            {savedCount > 0 && (
              <span className={cn(
                "ml-0.5 text-xs rounded-full px-1.5 py-0.5",
                filter === "saved" ? "bg-[#A39DFF]/30 text-[#C8C7FF]" : "bg-white/10 text-[#9CA3AF]"
              )}>
                {savedCount}
              </span>
            )}
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 rounded bg-white/5 animate-pulse" />
              <div className="rounded-2xl border border-white/10 overflow-hidden">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-16 bg-white/5 animate-pulse border-b border-white/5 last:border-0" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-[#0B0C10] p-12 text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-2xl bg-[#A39DFF]/15 border border-[#A39DFF]/20 flex items-center justify-center">
            <Mic className="h-5 w-5 text-[#A39DFF]" />
          </div>
          <h3 className="text-white text-lg font-semibold">No sessions yet</h3>
          <p className="text-[#9CA3AF] mt-1">Complete a practice session to see it here.</p>
          <div className="mt-6">
            <Link href="/practice">
              <Button className="bg-[#A39DFF] text-[#08090D] hover:bg-[#A39DFF]/90 font-bold px-7 rounded-full">
                Start a session
              </Button>
            </Link>
          </div>
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-[#0B0C10] p-12 text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-2xl bg-[#A39DFF]/15 border border-[#A39DFF]/20 flex items-center justify-center">
            <Bookmark className="h-5 w-5 text-[#A39DFF]" />
          </div>
          <h3 className="text-white text-lg font-semibold">No saved sessions</h3>
          <p className="text-[#9CA3AF] mt-1">Bookmark sessions you want to revisit by tapping the save icon.</p>
        </div>
      ) : (
        <div className="space-y-7">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#9CA3AF] mb-2 px-1">
                {group.label}
              </p>
              <div className="rounded-2xl border border-white/10 bg-[#0B0C10] overflow-hidden divide-y divide-white/5">
                {group.sessions.map((session) => (
                  <div key={session._id} className="relative flex items-center group">
                    <Link
                      href={`/sessions/${session._id}`}
                      className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors flex-1 min-w-0 pr-32"
                    >
                      <div className={cn(
                        "shrink-0 h-8 w-8 rounded-xl border flex items-center justify-center transition-colors",
                        session.isFavorited
                          ? "bg-[#A39DFF]/25 border-[#A39DFF]/40"
                          : "bg-[#A39DFF]/10 border-[#A39DFF]/20"
                      )}>
                        <Mic className="h-3.5 w-3.5 text-[#A39DFF]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {session.title || formatDisplayName(session.scenario)}
                        </p>
                        <p className="text-xs text-[#9CA3AF]">
                          {formatDisplayName(session.scenario)} · {formatTime(session.createdAt)}
                          {session.durationSeconds != null && session.durationSeconds > 0 && (
                            <> · {formatDuration(session.durationSeconds)}</>
                          )}
                        </p>
                      </div>
                    </Link>

                    {/* Right side: date + bookmark + delete + arrow */}
                    <div className="absolute right-4 flex items-center gap-2 shrink-0">
                      <span className="hidden sm:block text-xs text-[#9CA3AF]">{formatFullDate(session.createdAt)}</span>
                      <button
                        onClick={() => toggleFavorite(session._id, session.isFavorited)}
                        className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                        aria-label={session.isFavorited ? "Remove from saved" : "Save session"}
                      >
                        {session.isFavorited ? (
                          <BookmarkCheck className="h-4 w-4 text-[#A39DFF]" />
                        ) : (
                          <Bookmark className="h-4 w-4 text-[#9CA3AF] group-hover:text-white transition-colors" />
                        )}
                      </button>
                      {confirmingDelete === session._id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => { e.preventDefault(); deleteSession(session._id); }}
                            className="text-xs font-medium text-red-400 hover:text-red-300 px-1.5 py-1 rounded-lg hover:bg-red-500/10 transition-colors"
                          >
                            Delete?
                          </button>
                          <button
                            onClick={(e) => { e.preventDefault(); setConfirmingDelete(null); }}
                            className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-colors text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => { e.preventDefault(); setConfirmingDelete(session._id); }}
                          className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                          aria-label="Delete session"
                        >
                          <Trash2 className="h-4 w-4 text-[#9CA3AF] hover:text-red-400 transition-colors" />
                        </button>
                      )}
                      <ArrowRight className="h-4 w-4 text-[#9CA3AF] group-hover:text-[#A39DFF] group-hover:translate-x-0.5 transition-all pointer-events-none" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
