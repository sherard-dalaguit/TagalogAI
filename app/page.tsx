export default function Home() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-8 bg-black overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-fuchsia-500/20 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.05)_0%,transparent_70%)]" />

      <main className="flex flex-col gap-6 items-center text-center max-w-2xl z-10">
        <h1 className="text-5xl sm:text-7xl font-semibold font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
          TagalogAI
        </h1>
        <div className="h-1 w-20 bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
        <p className="text-xl sm:text-2xl text-zinc-400">
          Please be patient as we are still in development.
        </p>
      </main>

      {/* Border Accents */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-fuchsia-500/50 to-transparent" />
    </div>
  );
}
