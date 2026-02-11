"use client";

import React, { useState, useEffect } from "react";
import {ITranscriptMessage, IVoiceSessionDoc} from "@/database/voice-session.model";

export default function PracticeTestingPage() {
  const [sessions, setSessions] = useState<IVoiceSessionDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState<any>(null);

  // Transcript testing state
  const [transcript, setTranscript] = useState<ITranscriptMessage[]>([]);
  const [userText, setUserText] = useState("");
  const [aiText, setAiText] = useState("");

  // Fetch user preferences and initial sessions
  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const userRes = await fetch("/api/users/me");
        const userData = await userRes.json();
        if (userData.success) {
          setUser(userData.data);
        }

        const res = await fetch("/api/sessions");
        const data = await res.json();
        if (data.success) {
          setSessions(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sessions");
      const data = await res.json();
      if (data.success) {
        setSessions(data.data);
        setMessage("Sessions fetched successfully");
      } else {
        setMessage("Failed to fetch sessions: " + data.message);
      }
    } catch (err) {
      setMessage("Error fetching sessions");
    } finally {
      setLoading(false);
    }
  };

  const addTranscriptMessage = (speaker: "user" | "ai", text: string) => {
    if (!text.trim()) return;
    
    const newMessage: ITranscriptMessage = {
      order: transcript.length,
      speaker,
      text: text.trim(),
    };
    
    setTranscript([...transcript, newMessage]);
    if (speaker === "user") setUserText("");
    else setAiText("");
  };

  const createSession = async () => {
    if (!user) {
      setMessage("User not loaded. Please log in.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          mode: "conversation",
          scenario: "ordering_food",
          correctionIntensity: user.preferences?.correctionIntensity || "moderate",
          taglishMode: user.preferences?.taglishMode ?? false,
          transcript: transcript,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Session created successfully");
        setTranscript([]);
        await fetchSessions();
      } else {
        setMessage("Failed to create session: " + data.message);
      }
    } catch (err) {
      setMessage("Error creating session");
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/sessions/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Session deleted successfully");
        await fetchSessions();
      } else {
        setMessage("Failed to delete session");
      }
    } catch (err) {
      setMessage("Error deleting session");
    } finally {
      setLoading(false);
    }
  };

  const getSession = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/sessions/${id}`);
      const data = await res.json();
      if (data.success) {
        setMessage("Session details: " + JSON.stringify(data.data));
      } else {
        setMessage("Failed to get session");
      }
    } catch (err) {
      setMessage("Error getting session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-zinc-950 min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-4">API Testing Page (Voice Sessions)</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded">
          <h2 className="text-lg font-semibold mb-3 text-blue-400">User Speaking</h2>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={userText}
              onChange={(e) => setUserText(e.target.value)}
              placeholder="User message..."
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && addTranscriptMessage("user", userText)}
            />
            <button 
              onClick={() => addTranscriptMessage("user", userText)}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-medium"
            >
              Add
            </button>
          </div>
        </div>

        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded">
          <h2 className="text-lg font-semibold mb-3 text-purple-400">AI Speaking</h2>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={aiText}
              onChange={(e) => setAiText(e.target.value)}
              placeholder="AI message..."
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
              onKeyDown={(e) => e.key === 'Enter' && addTranscriptMessage("ai", aiText)}
            />
            <button 
              onClick={() => addTranscriptMessage("ai", aiText)}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-sm font-medium"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      <div className="mb-8 p-4 bg-zinc-900 border border-zinc-800 rounded">
        <h2 className="text-lg font-semibold mb-3">Transcript Preview</h2>
        {transcript.length === 0 ? (
          <p className="text-zinc-500 text-sm">No messages added yet.</p>
        ) : (
          <div className="space-y-2">
            {transcript.map((msg, i) => (
              <div key={i} className={`flex ${msg.speaker === 'user' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded text-sm ${
                  msg.speaker === 'user' 
                    ? 'bg-blue-900/30 border border-blue-500/30 text-blue-100' 
                    : 'bg-purple-900/30 border border-purple-500/30 text-purple-100'
                }`}>
                  <span className="font-bold mr-2 uppercase text-[10px] opacity-70">{msg.speaker}:</span>
                  {msg.text}
                </div>
              </div>
            ))}
            <button 
              onClick={() => setTranscript([])}
              className="mt-4 text-xs text-zinc-500 hover:text-zinc-300 underline"
            >
              Clear Transcript
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-4 mb-6">
        <button 
          onClick={createSession}
          disabled={loading || !user}
          className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded disabled:opacity-50"
        >
          POST /api/sessions (Create)
        </button>
        <button 
          onClick={fetchSessions}
          disabled={loading}
          className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded disabled:opacity-50"
        >
          GET /api/sessions (Fetch All)
        </button>
      </div>

      {user && (
        <div className="mb-6 p-4 bg-indigo-900/20 border border-indigo-500/30 rounded text-sm">
          <p className="font-bold text-indigo-300">Logged in User Info:</p>
          <p>ID: {user._id}</p>
          <p>Preferences: {user.preferences?.correctionIntensity}, Taglish: {String(user.preferences?.taglishMode)}</p>
        </div>
      )}

      {message && (
        <div className="mb-6 p-4 bg-zinc-900 border border-zinc-800 rounded text-sm break-all">
          <span className="font-bold text-indigo-400">Status:</span> {message}
        </div>
      )}

      <div className="grid gap-4">
        <h2 className="text-xl font-semibold">Voice Sessions</h2>
        {sessions.length === 0 ? (
          <p className="text-zinc-500">No sessions found.</p>
        ) : (
          sessions.map((session) => (
            <div key={session._id.toString()} className="p-4 bg-zinc-900 border border-zinc-800 rounded flex justify-between items-center">
              <div>
                <p className="font-medium">{session.scenario} ({session.mode})</p>
                <p className="text-xs text-zinc-500">ID: {session._id.toString()}</p>
                <p className="text-xs text-zinc-500">Prefs: {session.correctionIntensity}, Taglish: {String(session.taglishMode)}</p>
                {session.transcript && session.transcript.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase">Transcript:</p>
                    {session.transcript.map((msg, idx) => (
                      <p key={idx} className="text-[10px] text-zinc-400 line-clamp-1">
                        <span className="font-semibold uppercase">{msg.speaker}:</span> {msg.text}
                      </p>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => getSession(session._id.toString())}
                  className="text-xs bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded"
                >
                  Details
                </button>
                <button 
                  onClick={() => deleteSession(session._id.toString())}
                  className="text-xs bg-red-900/50 hover:bg-red-900 text-red-200 px-2 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
