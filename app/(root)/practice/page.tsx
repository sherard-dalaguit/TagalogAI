"use client";

import React, { useState, useEffect } from "react";

interface VoiceSession {
  _id: string;
  userId: string;
  mode: string;
  scenario: string;
  correctionIntensity: string;
  taglishMode: boolean;
  createdAt: string;
}

export default function PracticeTestingPage() {
  const [sessions, setSessions] = useState<VoiceSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState<any>(null);

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
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Session created successfully");
        fetchSessions();
      } else {
        setMessage("Failed to create session");
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
        fetchSessions();
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
            <div key={session._id} className="p-4 bg-zinc-900 border border-zinc-800 rounded flex justify-between items-center">
              <div>
                <p className="font-medium">{session.scenario} ({session.mode})</p>
                <p className="text-xs text-zinc-500">ID: {session._id}</p>
                <p className="text-xs text-zinc-500">Prefs: {session.correctionIntensity}, Taglish: {String(session.taglishMode)}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => getSession(session._id)}
                  className="text-xs bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded"
                >
                  Details
                </button>
                <button 
                  onClick={() => deleteSession(session._id)}
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
