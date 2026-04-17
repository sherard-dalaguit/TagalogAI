"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mic, ChevronLeft } from "lucide-react";

interface VoiceSession {
  _id: string;
  createdAt: string;
  mode?: string;
  scenario?: string;
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
      // group by "Month Year"
      label = d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
    }

    if (!buckets[label]) buckets[label] = [];
    buckets[label].push(s);
  }

  // Preserve order: Today → Yesterday → This Week → months newest-first
  const priority = ["Today", "Yesterday", "This Week"];
  const ordered = [
    ...priority.filter((l) => buckets[l]).map((l) => ({ label: l, sessions: buckets[l] })),
    ...Object.entries(buckets)
      .filter(([l]) => !priority.includes(l))
      .sort((a, b) => new Date(b[1][0].createdAt).getTime() - new Date(a[1][0].createdAt).getTime())
      .map(([label, sessions]) => ({ label, sessions })),
  ];

  return ordered;
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<VoiceSession[]>([]);
  const [loading, setLoading] = useState(true);

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

  const groups = groupSessions(sessions);

  return (
    <div className="max-w-2xl mx-auto px-4 pb-16 pt-2 space-y-8">
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
      ) : (
        <div className="space-y-7">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#9CA3AF] mb-2 px-1">
                {group.label}
              </p>
              <div className="rounded-2xl border border-white/10 bg-[#0B0C10] overflow-hidden divide-y divide-white/5">
                {group.sessions.map((session) => (
                  <Link
                    key={session._id}
                    href={`/sessions/${session._id}`}
                    className="flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="shrink-0 h-8 w-8 rounded-xl bg-[#A39DFF]/10 border border-[#A39DFF]/20 flex items-center justify-center">
                        <Mic className="h-3.5 w-3.5 text-[#A39DFF]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {formatDisplayName(session.scenario)}
                        </p>
                        <p className="text-xs text-[#9CA3AF]">
                          {formatDisplayName(session.mode)} · {formatTime(session.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="hidden sm:block text-xs text-[#9CA3AF]">{formatFullDate(session.createdAt)}</span>
                      <ArrowRight className="h-4 w-4 text-[#9CA3AF] group-hover:text-[#A39DFF] group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}