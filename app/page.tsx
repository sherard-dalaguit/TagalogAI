import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Background accents */}
      <div className="pointer-events-none absolute top-0 right-0 h-130 w-130 rounded-full bg-indigo-500/20 blur-[120px] translate-x-1/2 -translate-y-1/2" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-130 w-130 rounded-full bg-fuchsia-500/20 blur-[120px] -translate-x-1/2 translate-y-1/2" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.08)_0%,transparent_65%)]" />

      {/* Top border accents */}
      <div className="pointer-events-none absolute top-0 left-0 h-px w-full bg-linear-to-r from-transparent via-indigo-500/50 to-transparent" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-linear-to-r from-transparent via-fuchsia-500/50 to-transparent" />

      {/* Nav */}
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="TagalogAI Logo"
            width={36}
            height={36}
            className="object-contain drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)]"
          />
          <span className="text-md font-semibold tracking-wide">TagalogAI</span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href="#how-it-works"
            className="hidden rounded-md px-3 py-2 text-sm text-white/70 hover:text-white sm:inline"
          >
            How it works
          </Link>
          <Link
            href="#features"
            className="hidden rounded-md px-3 py-2 text-sm text-white/70 hover:text-white sm:inline"
          >
            Features
          </Link>
          <Link
            href="#faq"
            className="hidden rounded-md px-3 py-2 text-sm text-white/70 hover:text-white sm:inline"
          >
            FAQ
          </Link>

          <Button asChild variant="ghost" className="text-white/80 hover:text-white">
            <Link href="/log-in">Log in</Link>
          </Button>
          <Button asChild className="primary-gradient text-white hover:opacity-90">
            <Link href="/dashboard">Start practicing</Link>
          </Button>
        </nav>
      </header>

      {/* Hero (first screen height) */}
      <section className="relative z-10">
        <div className="mx-auto flex min-h-svh w-full max-w-6xl flex-col justify-center px-6 pb-12 pt-8">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            {/* Left: Copy */}
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full primary-gradient" />
                Speak Tagalog daily • Get coached instantly
              </p>

              <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-6xl">
                Speak Tagalog with an AI agent —
                <span className="block primary-text-gradient">then get real feedback</span>
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg">
                TagalogAI lets you practice speaking in realistic scenarios. After each conversation,
                you’ll receive a clear breakdown of your strengths, mistakes, and the next things to
                improve—like a coach that never gets tired.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button asChild size="lg" className="primary-gradient text-white hover:opacity-90">
                  <Link href="/log-in">Try a session</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10">
                  <Link href="#how-it-works">See how it works</Link>
                </Button>
              </div>

              <div className="mt-8 grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <div className="text-sm font-medium text-white/85">Talk naturally</div>
                  <div className="mt-1 text-xs text-white/60">Voice-first practice with an agent.</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <div className="text-sm font-medium text-white/85">Instant corrections</div>
                  <div className="mt-1 text-xs text-white/60">Grammar, word choice, clarity.</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <div className="text-sm font-medium text-white/85">Track progress</div>
                  <div className="mt-1 text-xs text-white/60">See patterns in your mistakes.</div>
                </div>
              </div>
            </div>

            {/* Right: “Product preview” */}
            <div className="relative">
              <div className="absolute -inset-6 rounded-[32px] bg-linear-to-b from-indigo-500/10 via-fuchsia-500/10 to-transparent blur-2xl" />

              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_0_50px_rgba(0,0,0,0.45)] backdrop-blur">
                <div className="flex items-center justify-between border-b border-white/10 bg-black/20 px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-white/20" />
                    <div className="h-2.5 w-2.5 rounded-full bg-white/20" />
                    <div className="h-2.5 w-2.5 rounded-full bg-white/20" />
                  </div>
                  <div className="text-xs text-white/55">Conversation feedback</div>
                </div>

                <div className="space-y-5 p-5">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-xs text-white/50">You said</div>
                    <div className="mt-2 text-sm text-white/85">
                      “Gusto ko mag-order ng kape… uh… large?”
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-white/50">AI feedback</div>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/60">
                        Clear + friendly
                      </span>
                    </div>

                    <div className="mt-3 space-y-3 text-sm">
                      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <div className="text-white/80 font-medium">Strength</div>
                        <div className="mt-1 text-white/60">
                          Natural sentence start (“Gusto ko…”) and correct verb usage.
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <div className="text-white/80 font-medium">Fix</div>
                        <div className="mt-1 text-white/60">
                          For ordering sizes, try: <span className="text-white/85">“Malaki po”</span> or{" "}
                          <span className="text-white/85">“Large po”</span>.
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <div className="text-white/80 font-medium">Next prompt</div>
                        <div className="mt-1 text-white/60">
                          Practice a café scenario: greeting → order → ask for price → thank you.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div>
                      <div className="text-xs text-white/50">Session score</div>
                      <div className="mt-1 text-lg font-semibold">
                        82 <span className="text-sm font-normal text-white/50">/ 100</span>
                      </div>
                    </div>
                    <div className="h-10 w-10 rounded-2xl primary-gradient shadow-[0_0_24px_rgba(139,92,246,0.35)]" />
                  </div>
                </div>
              </div>

              <p className="mt-4 text-center text-xs text-white/45">
                Modern coaching vibes, without the awkward “uhh…” pauses.
              </p>
            </div>
          </div>

          {/* Scroll hint */}
          <div className="mt-12 flex justify-center">
            <Link
              href="#how-it-works"
              className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/60 backdrop-blur hover:text-white/80"
            >
              <span className="h-1.5 w-1.5 rounded-full primary-gradient" />
              Scroll to learn more
              <span className="ml-1 opacity-60 transition-transform group-hover:translate-y-0.5">↓</span>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative z-10 mx-auto w-full max-w-6xl px-6 py-20">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">How TagalogAI helps you improve</h2>
          <p className="mt-4 text-white/65">
            You speak. The agent responds naturally. Then you get a structured review so you know exactly what to do next.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="text-sm font-medium text-white/85">1) Speak with an AI agent</div>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              Practice real scenarios (ordering food, introductions, small talk, travel) instead of random flashcards.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="text-sm font-medium text-white/85">2) Get corrections that make sense</div>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              Receive clear notes on grammar, vocabulary, and phrasing—plus better alternatives you can reuse.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="text-sm font-medium text-white/85">3) See your strengths & mistakes</div>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              Understand patterns: what you’re doing well, what you keep missing, and what to focus on next session.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-3xl border border-white/10 bg-linear-to-r from-indigo-500/10 via-fuchsia-500/10 to-transparent p-6 md:flex-row md:items-center">
          <div>
            <div className="text-sm font-medium text-white/85">Ready to practice out loud?</div>
            <div className="mt-1 text-sm text-white/60">
              Start a session and get actionable feedback in minutes.
            </div>
          </div>
          <Button asChild className="primary-gradient text-white hover:opacity-90">
            <Link href="/log-in">Start practicing</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-20">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Built like a modern SaaS tutor</h2>
          <p className="mt-4 text-white/65">
            Polished experience, focused learning outcomes, and feedback you can actually apply.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="text-sm font-medium text-white/85">Scenario-based practice</div>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              Pick situations you’ll use in real life so your speaking skills transfer immediately.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="text-sm font-medium text-white/85">Personalized coaching notes</div>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              Corrections and suggestions that match your level (and don’t read like a textbook).
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="text-sm font-medium text-white/85">Strength + mistake breakdown</div>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              Celebrate what you’re doing right, and focus on the few changes that give the biggest gains.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="text-sm font-medium text-white/85">Progress you can feel</div>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              Consistent practice + consistent review = faster confidence when speaking Tagalog.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-24">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">FAQ</h2>
          <p className="mt-4 text-white/65">A few quick answers to common questions.</p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="text-sm font-medium text-white/85">Is it beginner-friendly?</div>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              Yes—start simple, and the feedback will guide you. You’ll get suggested alternatives that fit your level.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="text-sm font-medium text-white/85">Do I have to use voice?</div>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              The landing page is designed for voice-first practice, but you can expand to text-based practice too if you want.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="text-sm font-medium text-white/85">What kind of feedback do I get?</div>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              Strengths, mistakes, better phrasing options, and recommended next prompts so you always know what to practice next.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="text-sm font-medium text-white/85">How do I start?</div>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              Click “Start practicing” to log in and begin a session.
            </p>
          </div>
        </div>

        <div className="mt-12 flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div>
            <div className="text-sm font-medium text-white/85">Start your first session today</div>
            <div className="mt-1 text-sm text-white/60">Build speaking confidence one conversation at a time.</div>
          </div>
          <Button asChild className="primary-gradient text-white hover:opacity-90">
            <Link href="/log-in">Start practicing</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/20">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-white/45">© {new Date().getFullYear()} TagalogAI</div>
          <div className="flex items-center gap-4 text-xs">
            <Link href="#how-it-works" className="text-white/45 hover:text-white/70">
              How it works
            </Link>
            <Link href="#features" className="text-white/45 hover:text-white/70">
              Features
            </Link>
            <Link href="/log-in" className="text-white/45 hover:text-white/70">
              Log in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}