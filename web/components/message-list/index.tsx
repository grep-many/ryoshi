import { useAITeacher } from "@/hooks";
import React from "react";
import { RenderJapanese } from "./render-japanese";
import { RenderEnglish } from "./render-english";

export const MessagesList = () => {
  const { messages, playMessage, currentMessage, classroom, stopMessage } = useAITeacher();

  const container = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const view = container.current;
    if (!view) return;
    view.scrollTo({
      top: view.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length]);

  return (
    <div
      className={`${
        classroom === "default" ? "h-169 w-322" : "h-214 w-632"
      } flex flex-col space-y-8 overflow-y-auto bg-transparent p-8 opacity-80`}
      ref={container}
    >
      {messages.length === 0 && (
        <div className="grid h-full w-full place-content-center text-center">
          <h2 className="text-8xl font-bold text-white/90 italic">
            Ryoshi
            <br />
            Japanese Language School
          </h2>
          <h2 className="font-jp text-8xl font-bold text-red-600/90 italic">ワワ先生日本語学校</h2>
        </div>
      )}
      {messages.map((message, i) => (
        <div key={i}>
          <div className="flex">
            <div className="grow">
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-2xl font-bold text-white/90 uppercase ${
                    message.speech === "formal" ? "bg-indigo-600" : "bg-teal-600"
                  }`}
                >
                  {message.speech}
                </span>
                <RenderEnglish englishText={message.answer?.english} />
              </div>
              <RenderJapanese japanese={message.answer?.japanese} />
            </div>
            {currentMessage === message ? (
              <button className="text-white/65" onClick={() => stopMessage(message)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-16 w-16"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874c0 .311-.252.563-.563.563H9.564A.562.562 0 0 1 9 14.437V9.564Z"
                  />
                </svg>
              </button>
            ) : (
              <button className="text-white/65" onClick={() => playMessage(message)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-16 w-16"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z"
                  />
                </svg>
              </button>
            )}
          </div>
          <div className="mt-5 rounded-xl bg-linear-to-br from-pink-200/20 to-pink-500/20 p-5">
            <span className="inline-block bg-linear-to-b from-white/90 to-white/70 bg-clip-text pr-4 text-3xl font-bold text-transparent uppercase italic">
              Grammar Breakdown
            </span>
            {message.answer?.grammarBreakdown.map((grammar, i) => (
              <div key={i} className="mt-3">
                {message.answer && message.answer.grammarBreakdown.length > 1 && (
                  <>
                    <RenderEnglish englishText={grammar.english} />
                    <RenderJapanese japanese={grammar.japanese} />
                  </>
                )}

                <div className="mt-3 flex flex-wrap items-end gap-3">
                  {grammar.chunks.map((chunk, i) => (
                    <div key={i} className="rounded-md bg-black/30 p-2">
                      <p className="font-jp text-4xl text-white/90">
                        <RenderJapanese japanese={chunk.japanese} />
                      </p>
                      <p className="text-2xl text-pink-300/90">{chunk.meaning}</p>
                      <p className="text-2xl text-blue-400/90">{chunk.grammar}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
