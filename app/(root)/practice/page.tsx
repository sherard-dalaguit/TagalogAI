"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Agent from "@/components/voice-agent/Agent";

export default function PracticePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function init() {
      try {
        // 1. Get user data
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
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-white">Practice Tagalog</h1>
        <p className="text-[#9CA3AF]">
          Speak with our AI agent to improve your Tagalog skills in real-time.
        </p>
      </div>

      <div className="w-full max-w-4xl mx-auto">
        <Agent user={user} />
      </div>
    </div>
  );
}
