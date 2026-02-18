"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, ArrowRight, Sparkles, Mic, Flame, History, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceSession {
  _id: string;
  createdAt: string;
  mode?: string;
  scenario?: string;
}

function formatDisplayName(str: string | undefined) {
  if (!str) return "Conversation";
  return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatShortDate(date: string) {
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatRelative(date: string) {
  const d = new Date(date).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - d);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

const Dashboard = () => {
  const [recentSessions, setRecentSessions] = useState<VoiceSession[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dailyUsage, setDailyUsage] = useState({ totalSeconds: 0, dailyLimitSeconds: 600 });

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const res = await fetch("/api/user/daily-usage");
        const data = await res.json();
        if (data.success) {
          setDailyUsage(data.data);
        }
      } catch (err) {
        console.error("Error fetching usage:", err);
      }
    };
    fetchUsage();
  }, []);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch("/api/sessions");
        const data = await response.json();

        if (data.success) {
          const sorted = data.data
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

          setRecentSessions(sorted);
        }
      } catch (error) {
        console.error("Error fetching sessions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const displayedSessions = showAll ? recentSessions : recentSessions.slice(0, 8);
  const lastSession = recentSessions[0];
  const totalSessionsLoaded = recentSessions.length;
  const lastPracticedLabel = lastSession ? formatRelative(lastSession.createdAt) : "Not yet";

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  return (
    <div className="max-w-6xl mx-auto pb-10 px-4 space-y-10">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0B0C10]">
        <div className="absolute inset-0 opacity-70">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#A39DFF]/20 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
        </div>

        <div className="relative p-8 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-4">
              {/* pill */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#A39DFF]/30 bg-[#A39DFF]/10 px-3 py-1 text-xs text-[#C8C7FF]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Phase 1 • Speak Naturally
                </span>

                <span className="hidden sm:block items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[#9CA3AF]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#9CA3AF]" />
                  Phase 2 • Guided Coaching
                  <span className="ml-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-[#9CA3AF]">
                    Coming soon
                  </span>
                </span>

                <span className="hidden sm:block items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[#9CA3AF]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#9CA3AF]" />
                  Phase 3 • Mastery & Progress
                  <span className="ml-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-[#9CA3AF]">
                    Later
                  </span>
                </span>
              </div>

              {/* title */}
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                {greeting}. <span className="text-[#A39DFF]">Mag-usap tayo</span>
                <br className="hidden md:block" />
                {" "}sa tunay na Tagalog.
              </h1>

              {/* subtitle */}
              <p className="text-[#9CA3AF] max-w-2xl">
                Usap lang — tapos may feedback sa dulo. Get improved phrases and recurring mistakes after each session.
              </p>

              {/* ctas */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Link href="/practice">
                  <Button className="bg-[#A39DFF] text-[#08090D] hover:bg-[#A39DFF]/90 font-bold px-7 rounded-full">
                    Start a session
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>

                {lastSession && (
                  <Link href={`/sessions/${lastSession._id}`}>
                    <Button
                      variant="outline"
                      className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10"
                    >
                      Continue from last session
                      <History className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                )}
              </div>

              {/* inline stats UNDER CTAs */}
              <div className="hidden sm:flex flex-wrap items-center gap-5 pt-3 text-sm text-[#9CA3AF]">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-[#A39DFF]" />
                  <span>
                    <span className="text-white font-semibold">{totalSessionsLoaded}</span> sessions
                  </span>
                </div>

                <span className="hidden md:inline-block h-4 w-px bg-white/10" />

                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-[#A39DFF]" />
                  <span>
                    Last practiced{" "}
                    <span className="text-white font-semibold">{lastPracticedLabel}</span>
                   </span>
                </div>

                <span className="hidden md:inline-block h-4 w-px bg-white/10" />

                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-[#A39DFF]" />
                  <span>
                     Streak <span className="text-white font-semibold">—</span>
                   </span>
                </div>

                <span className="hidden md:inline-block h-4 w-px bg-white/10" />

                <div className="flex items-center gap-2">
                  <Mic className="h-4 w-4 text-[#A39DFF]" />
                  <span>
                    Daily: <span className={cn("font-semibold", dailyUsage.totalSeconds >= dailyUsage.dailyLimitSeconds ? "text-red-400" : "text-white")}>
                      {Math.floor(dailyUsage.totalSeconds / 60)}/{Math.floor(dailyUsage.dailyLimitSeconds / 60)} min
                    </span>
                  </span>
                </div>
              </div>

              {/* chips */}
              <div className="mt-2 hidden sm:flex flex-wrap gap-2 text-xs text-[#9CA3AF]">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">End-of-session feedback</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Improved phrases</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Recurring mistakes</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* PRACTICE (single mode) */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">Practice</h2>
        </div>

        <Card className="group bg-[#0B0C10] border-white/10 hover:border-[#A39DFF]/40 transition-all rounded-2xl">
          <CardContent className="p-6 md:p-7">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-[#A39DFF]/15 border border-[#A39DFF]/20 flex items-center justify-center">
                  <Mic className="h-5 w-5 text-[#A39DFF]" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-semibold text-white">Free-style Conversation</h3>
                    <span className="text-[10px] uppercase tracking-wider text-[#A39DFF] font-semibold bg-[#A39DFF]/10 px-2 py-0.5 rounded">
                      Core
                    </span>
                  </div>
                  <p className="text-[#9CA3AF] max-w-xl">
                    Natural, open-ended Tagalog conversation. No interruptions — corrections happen at the end.
                  </p>

                  <div className="mt-3 flex items-center gap-2 text-sm text-[#9CA3AF]">
                    <CalendarDays className="w-4 h-4" />
                    <span>
                      {lastSession ? `Last session: ${formatShortDate(lastSession.createdAt)}` : "No sessions yet"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {lastSession && (
                  <Link href={`/sessions/${lastSession._id}`}>
                    <Button
                      variant="outline"
                      className="rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10"
                    >
                      View last analysis
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                )}

                <Link href="/practice">
                  <Button className="bg-[#A39DFF] text-[#08090D] hover:bg-[#A39DFF]/90 font-bold px-7 rounded-full">
                    Start
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="mt-6 h-px w-full bg-linear-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </CardContent>
        </Card>
      </section>

      {/* RECENT SESSIONS */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">Recent Sessions</h2>
          {recentSessions.length > 8 && (
            <Button
              variant="link"
              className="text-[#A39DFF] p-0"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? "View less" : "View all"}
            </Button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-44 rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
            ))}
          </div>
        ) : displayedSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayedSessions.map((session) => (
              <Card
                key={session._id}
                className="bg-[#0B0C10] border-white/10 hover:border-[#A39DFF]/35 transition-all rounded-2xl hover:-translate-y-0.5"
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] uppercase tracking-wider text-[#A39DFF] font-semibold bg-[#A39DFF]/10 px-2 py-0.5 rounded">
                      {formatDisplayName(session.mode)}
                    </span>
                    <span className="text-[10px] text-[#9CA3AF]">{formatShortDate(session.createdAt)}</span>
                  </div>

                  <CardTitle className="text-lg text-white">
                    {session.scenario ? formatDisplayName(session.scenario) : "General Session"}
                  </CardTitle>
                  <CardDescription className="text-[#9CA3AF]">{formatRelative(session.createdAt)}</CardDescription>
                </CardHeader>

                <CardContent className="p-4 pt-2">
                  <Link href={`/sessions/${session._id}`}>
                    <Button
                      variant="outline"
                      className="w-full rounded-xl border-white/10 bg-white/5 text-[#C9C9D4] hover:text-white hover:bg-white/10 group"
                    >
                      View Analysis
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 bg-[#0B0C10] p-10 text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-2xl bg-[#A39DFF]/15 border border-[#A39DFF]/20 flex items-center justify-center">
              <Mic className="h-5 w-5 text-[#A39DFF]" />
            </div>
            <h3 className="text-white text-lg font-semibold">No sessions yet</h3>
            <p className="text-[#9CA3AF] mt-1 max-w-md mx-auto">
              Start your first conversation. You’ll get end-of-session feedback with improved phrases and recurring mistakes.
            </p>
            <div className="mt-6">
              <Link href="/practice">
                <Button className="bg-[#A39DFF] text-[#08090D] hover:bg-[#A39DFF]/90 font-bold px-7 rounded-full">
                  Start a session
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
