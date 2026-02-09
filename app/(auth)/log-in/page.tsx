import LogIn from "@/components/log-in";
import React from "react";

export default function LogInPage() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-black overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-fuchsia-500/20 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.05)_0%,transparent_70%)]" />

      {/* Content */}
      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center py-24">
        {/* Hero */}
        <div className="text-center">
          <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full primary-gradient" />
            TagalogAI • Master Tagalog with AI
          </p>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Log in to your dashboard
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/60">
            Practice Tagalog with AI, get instant corrections, and track your progress 
            towards fluency.
          </p>
        </div>

        {/* Space between hero and card */}
        <div className="mt-12 w-full max-w-lg">
          <LogIn />
        </div>

        {/* Optional: less cramped “value props” (only 2, wider, more breathable) */}
        <div className="mt-10 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/60 backdrop-blur">
            <div className="text-white/85 font-medium">AI Conversations</div>
            <div className="mt-1">Practice Tagalog in realistic scenarios with real-time feedback.</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/60 backdrop-blur">
            <div className="text-white/85 font-medium">Smart Corrections</div>
            <div className="mt-1">Learn grammar and vocabulary through personalized coaching.</div>
          </div>
        </div>

        <p className="mt-12 text-center text-xs text-white/40">
          Secure OAuth sign-in — no passwords stored.
        </p>
      </div>

      {/* Border Accents */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-fuchsia-500/50 to-transparent" />
    </div>
  )
}