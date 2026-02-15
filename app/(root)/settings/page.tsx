"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Settings, 
  Trash2, 
  Save, 
  ChevronLeft, 
  AlertTriangle,
  Zap,
  MessageSquare,
  Languages
} from "lucide-react";
import Link from "next/link";

interface UserPreferences {
  correctionIntensity: "minimal" | "moderate" | "aggressive";
  taglishMode: boolean;
  preferredTone: "casual" | "polite" | "playful" | "coach";
}

const SettingsPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [preferences, setPreferences] = useState<UserPreferences>({
    correctionIntensity: "moderate",
    taglishMode: false,
    preferredTone: "casual",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/users/me");
        const data = await response.json();
        if (data.success) {
          setUser(data.data);
          if (data.data.preferences) {
            setPreferences(data.data.preferences);
          }
        } else {
          router.push("/log-in");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences }),
      });
      const data = await response.json();
      if (data.success) {
        // Success feedback could be added here
        console.log("Preferences saved successfully");
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?._id) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/users/${user._id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        await signOut({ callbackUrl: "/" });
      }
    } catch (error) {
      console.error("Error deleting account:", error);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto pb-10 px-4 pt-10 flex justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#A39DFF] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 px-4 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Link 
            href="/dashboard" 
            className="flex items-center text-sm text-[#9CA3AF] hover:text-white transition-colors mb-2"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Settings className="h-8 w-8 text-[#A39DFF]" />
            Settings & Preferences
          </h1>
          <p className="text-[#9CA3AF]">
            Manage your TagalogAI experience and account settings.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Learning Preferences */}
        <Card className="bg-[#0B0C10] border-white/10 rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-white/5 bg-white/5">
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-[#A39DFF]" />
              Learning Experience
            </CardTitle>
            <CardDescription className="text-[#9CA3AF]">
              Customize how the AI interacts with you and provides feedback.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-8">
            {/* Correction Intensity */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-white font-medium flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-[#A39DFF]" />
                  Correction Intensity
                </label>
                <span className="text-xs text-[#A39DFF] bg-[#A39DFF]/10 px-2 py-0.5 rounded-full capitalize font-semibold">
                  {preferences.correctionIntensity}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(["minimal", "moderate", "aggressive"] as const).map((intensity) => (
                  <button
                    key={intensity}
                    onClick={() => setPreferences({ ...preferences, correctionIntensity: intensity })}
                    className={`py-2 px-3 rounded-xl text-sm font-medium transition-all border ${
                      preferences.correctionIntensity === intensity
                        ? "bg-[#A39DFF]/20 border-[#A39DFF] text-white"
                        : "bg-white/5 border-white/10 text-[#9CA3AF] hover:bg-white/10 hover:border-white/20"
                    }`}
                  >
                    {intensity.charAt(0).toUpperCase() + intensity.slice(1)}
                  </button>
                ))}
              </div>
              <p className="text-xs text-[#9CA3AF]">
                {preferences.correctionIntensity === "minimal" && "Only critical grammar mistakes will be highlighted."}
                {preferences.correctionIntensity === "moderate" && "Common mistakes and natural phrasing will be suggested."}
                {preferences.correctionIntensity === "aggressive" && "Every minor error and better alternative will be shown."}
              </p>
            </div>

            {/* Taglish Mode */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="space-y-1">
                <label className="text-white font-medium flex items-center gap-2">
                  <Languages className="h-4 w-4 text-[#A39DFF]" />
                  Taglish Mode
                </label>
                <p className="text-xs text-[#9CA3AF]">
                  Allow the AI to use English words for a more natural, modern Manila-style conversation.
                </p>
              </div>
              <button
                onClick={() => setPreferences({ ...preferences, taglishMode: !preferences.taglishMode })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  preferences.taglishMode ? "bg-[#A39DFF]" : "bg-white/20"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.taglishMode ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Preferred Tone */}
            <div className="space-y-3">
              <label className="text-white font-medium flex items-center gap-2">
                <Zap className="h-4 w-4 text-[#A39DFF]" />
                Preferred AI Tone
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {(["casual", "polite", "playful", "coach"] as const).map((tone) => (
                  <button
                    key={tone}
                    onClick={() => setPreferences({ ...preferences, preferredTone: tone })}
                    className={`py-2 px-3 rounded-xl text-sm font-medium transition-all border ${
                      preferences.preferredTone === tone
                        ? "bg-[#A39DFF]/20 border-[#A39DFF] text-white"
                        : "bg-white/5 border-white/10 text-[#9CA3AF] hover:bg-white/10 hover:border-white/20"
                    }`}
                  >
                    {tone.charAt(0).toUpperCase() + tone.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-end">
              <Button
                onClick={handleSavePreferences}
                disabled={saving}
                className="bg-[#A39DFF] text-[#08090D] hover:bg-[#A39DFF]/90 font-bold px-8 rounded-full h-11"
              >
                {saving ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#08090D] border-t-transparent mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Preferences
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="bg-[#0B0C10] border-red-900/30 rounded-2xl overflow-hidden shadow-2xl shadow-red-900/5">
          <CardHeader className="bg-red-950/20 border-b border-red-900/20">
            <CardTitle className="text-xl text-red-400 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription className="text-red-400/60">
              Irreversible actions related to your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {!showDeleteConfirm ? (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-white font-medium">Delete Account</h3>
                  <p className="text-sm text-[#9CA3AF]">
                    Once you delete your account, there is no going back. All your sessions and feedback will be permanently removed.
                  </p>
                </div>
                <Button
                  onClick={() => setShowDeleteConfirm(true)}
                  variant="outline"
                  className="border-red-900/50 text-red-400 hover:bg-red-950/30 hover:text-red-300 rounded-full px-6"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            ) : (
              <div className="bg-red-950/30 border border-red-900/50 p-6 rounded-2xl space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-red-500/20 p-2 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-red-400" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-white font-bold text-lg">Are you absolutely sure?</h3>
                    <p className="text-sm text-red-200/70">
                      This action will permanently delete your profile, 
                      {user?.email && ` (${user.email}) `} 
                      and all associated data including session history, AI feedback, and learning progress.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Button
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold px-8 rounded-full"
                  >
                    {deleting ? "Deleting..." : "Yes, Delete My Account"}
                  </Button>
                  <Button
                    onClick={() => setShowDeleteConfirm(false)}
                    variant="outline"
                    className="border-white/10 bg-white/5 text-white hover:bg-white/10 rounded-full px-8"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
