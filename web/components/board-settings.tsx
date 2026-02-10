"use client";

import { teachers, useAITeacher, TeacherOpt, SpeechType, ClassRoomType } from "@/hooks";
import React from "react";

export const BoardSettings: React.FC = () => {
  // Zustand State Selectors
  const {
    furigana,
    setFurigana,
    english,
    setEnglish,
    teacher,
    setTeacher,
    speech,
    setSpeech,
    classroom,
    setClassroom,
  } = useAITeacher();

  return (
    <>
      {/* Teacher Selection */}
      <div className="absolute right-0 bottom-full mb-20 flex flex-row gap-10">
        {teachers.map((sensei: TeacherOpt, idx: number) => (
          <div
            key={idx}
            className={`p-3 transition-colors duration-500 ${
              teacher === sensei ? "bg-white/80" : "bg-white/40"
            }`}
          >
            <div
              onClick={() => setTeacher(sensei)}
              className="cursor-pointer transition-opacity hover:opacity-80"
            >
              <img src={`/images/${sensei}.jpg`} alt={sensei} className="h-40 w-40 object-cover" />
            </div>
            <h2 className="mt-3 text-center text-3xl font-bold">{sensei}</h2>
          </div>
        ))}
      </div>

      {/* Classroom Selection */}
      <div className="absolute bottom-full left-0 mb-20 flex flex-row gap-2">
        {(["default", "alternative"] as ClassRoomType[]).map((type) => (
          <button
            key={type}
            className={`${
              classroom === type ? "bg-slate-900/40 text-white" : "bg-slate-700/20 text-white/45"
            } rounded-full px-10 py-4 text-4xl capitalize backdrop-blur-md transition-colors duration-500`}
            onClick={() => setClassroom(type)}
          >
            {type} classroom
          </button>
        ))}
      </div>

      {/* Speech Style Selection */}
      <div className="absolute top-full left-0 mt-20 flex flex-row gap-2">
        {(["formal", "casual"] as SpeechType[]).map((type) => (
          <button
            key={type}
            className={`${
              speech === type ? "bg-slate-900/40 text-white" : "bg-slate-700/20 text-white/45"
            } rounded-full px-10 py-4 text-4xl capitalize backdrop-blur-md transition-colors duration-500`}
            onClick={() => setSpeech(type)}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Toggle Settings */}
      <div className="absolute top-full right-0 mt-20 flex flex-row gap-2">
        <button
          className={`${
            furigana ? "bg-slate-900/40 text-white" : "bg-slate-700/20 text-white/45"
          } rounded-full px-10 py-4 text-4xl backdrop-blur-md transition-colors duration-500`}
          onClick={() => setFurigana(!furigana)}
        >
          Furigana
        </button>
        <button
          className={`${
            english ? "bg-slate-900/40 text-white" : "bg-slate-700/20 text-white/45"
          } rounded-full px-10 py-4 text-4xl backdrop-blur-md transition-colors duration-500`}
          onClick={() => setEnglish(!english)}
        >
          English
        </button>
      </div>
    </>
  );
};
