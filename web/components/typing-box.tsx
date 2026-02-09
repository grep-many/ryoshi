"use client";
import { useAITeacher } from "@/hooks";
import React from "react";

export const TypingBox = () => {
  const [question, setQuestion] = React.useState("");
  const { askAI, loading } = useAITeacher();

  const ask = () => {
    askAI(question);
    setQuestion("");
  };

  return (
    <div className="to-slate-600-400/30 z-10 flex max-w-150 flex-col space-y-6 rounded-xl border border-slate-100/30 bg-linear-to-tr from-slate-300/30 via-gray-400/30 p-4 backdrop-blur-md">
      <div>
        <h2 className="text-xl font-bold text-white">How to say in Japanese?</h2>
        <p className="text-white/65">
          Type a sentence you want to say in Japanese and AI Sensei will translate it for you.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center">
          <span className="relative flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex h-4 w-4 rounded-full bg-white"></span>
          </span>
        </div>
      ) : (
        <div className="flex gap-3">
          <input
            className="flex-grow rounded-full bg-slate-800/60 p-2 px-4 text-white shadow-inner shadow-slate-900/60 placeholder:text-white/50 focus:outline focus:outline-white/80"
            placeholder="Have you ever been to Japan?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                ask();
              }
            }}
          />
          <button className="rounded-full bg-slate-100/20 p-2 px-6 text-white" onClick={ask}>
            Ask
          </button>
        </div>
      )}
    </div>
  );
};
