"use client";

import { useEffect, useRef, useState } from "react";
import { SavedMessage } from "./Agent";

interface Props {
  messages: SavedMessage[];
  onConfirm: (edited: SavedMessage[]) => void;
  onSkip: () => void;
}

export default function TranscriptEditModal({ messages, onConfirm, onSkip }: Props) {
  const [editedTexts, setEditedTexts] = useState<string[]>(() => messages.map(m => m.content));
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (activeIndex !== null && textareaRef.current) {
      const el = textareaRef.current;
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    }
  }, [activeIndex]);

  const handleTextChange = (value: string) => {
    if (activeIndex === null) return;
    setEditedTexts(prev => {
      const next = [...prev];
      next[activeIndex] = value;
      return next;
    });
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      setActiveIndex(null);
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      setActiveIndex(null);
    }
  };

  const handleConfirm = () => {
    onConfirm(messages.map((m, i) => ({ ...m, content: editedTexts[i] })));
  };

  const userMessageCount = messages.filter(m => m.role === "user").length;
  const isEmpty = messages.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-2xl flex flex-col max-h-[85vh]">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/10 shrink-0">
          <h2 className="text-xl font-bold text-white">Review Your Transcript</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Tap any of your lines to fix transcription errors before AI review.
          </p>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {isEmpty ? (
            <p className="text-sm text-zinc-500 text-center py-8">No speech was captured during this session.</p>
          ) : (
            messages.map((msg, i) => {
              if (msg.role === "assistant") {
                return (
                  <div key={i} className="flex flex-col items-end">
                    <span className="text-[10px] font-bold uppercase text-purple-400 mb-1">AI</span>
                    <div className="max-w-[90%] bg-purple-600/10 border border-purple-500/20 text-purple-50 px-4 py-3 rounded-2xl text-sm leading-relaxed">
                      {msg.content}
                    </div>
                  </div>
                );
              }

              return (
                <div key={i} className="flex flex-col items-start">
                  <span className="text-[10px] font-bold uppercase text-blue-400 mb-1">You</span>
                  {activeIndex === i ? (
                    <textarea
                      ref={textareaRef}
                      className="w-full bg-zinc-800 border border-blue-500/40 focus:border-blue-400 focus:outline-none text-blue-50 text-sm leading-relaxed px-4 py-3 rounded-2xl resize-none overflow-hidden"
                      value={editedTexts[i]}
                      onChange={e => handleTextChange(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onBlur={() => setActiveIndex(null)}
                      rows={1}
                    />
                  ) : (
                    <button
                      className="max-w-[90%] text-left bg-blue-600/10 border border-blue-500/20 hover:border-blue-400/50 text-blue-50 px-4 py-3 rounded-2xl text-sm leading-relaxed cursor-text transition-colors group relative"
                      onClick={() => setActiveIndex(i)}
                    >
                      {editedTexts[i]}
                      <svg
                        className="absolute top-2.5 right-3 size-3 text-blue-400/0 group-hover:text-blue-400/70 transition-colors"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6.586-6.586a2 2 0 012.828 2.828L11.828 13.828A2 2 0 019 15H7v-2a2 2 0 012-2z" />
                      </svg>
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-4 border-t border-white/10 flex items-center justify-between shrink-0">
          <span className="text-sm text-zinc-500">
            {isEmpty ? "No messages" : `${userMessageCount} of your line${userMessageCount !== 1 ? "s" : ""} are editable`}
          </span>
          <div className="flex items-center gap-3">
            <button
              className="text-sm text-zinc-400 hover:text-white transition-colors px-4 py-2"
              onClick={onSkip}
            >
              Skip Editing
            </button>
            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm px-5 py-2 rounded-full transition-colors"
              onClick={handleConfirm}
            >
              {isEmpty ? "Continue Anyway" : "Analyze My Speech →"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
