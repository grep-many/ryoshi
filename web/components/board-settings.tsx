import { useAITeacher } from "@/hooks";
import { teachers } from "./teacher";

export const BoardSettings = () => {
  const {
    english,
    setEnglish,
    furigana,
    setFurigana,
    speech,
    setSpeech,
    teacher,
    setTeacher,
    classroom,
    setClassroom,
  } = useAITeacher();
  return (
    <>
      <>
        <div className="absolute right-0 bottom-full mb-20 flex flex-row gap-10">
          {teachers.map((sensei, idx) => (
            <div
              key={idx}
              className={`p-3 transition-colors duration-500 ${
                teacher === sensei ? "bg-white/80" : "bg-white/40"
              }`}
            >
              <div onClick={() => setTeacher(sensei)}>
                <img
                  src={`/images/${sensei}.jpg`}
                  alt={sensei}
                  className="h-40 w-40 object-cover"
                />
              </div>
              <h2 className="mt-3 text-center text-3xl font-bold">{sensei}</h2>
            </div>
          ))}
        </div>
        <div className="absolute bottom-full left-0 mb-20 flex flex-row gap-2">
          <button
            className={` ${
              classroom === "default"
                ? "bg-slate-900/40 text-white"
                : "bg-slate-700/20 text-white/45"
            } rounded-full px-10 py-4 text-4xl backdrop-blur-md transition-colors duration-500`}
            onClick={() => setClassroom("default")}
          >
            Default classroom
          </button>
          <button
            className={` ${
              classroom === "alternative"
                ? "bg-slate-900/40 text-white"
                : "bg-slate-700/20 text-white/45"
            } rounded-full px-10 py-4 text-4xl backdrop-blur-md transition-colors duration-500`}
            onClick={() => setClassroom("alternative")}
          >
            Alternative classroom
          </button>
        </div>
        <div className="absolute top-full left-0 mt-20 flex flex-row gap-2">
          <button
            className={` ${
              speech === "formal" ? "bg-slate-900/40 text-white" : "bg-slate-700/20 text-white/45"
            } rounded-full px-10 py-4 text-4xl backdrop-blur-md transition-colors duration-500`}
            onClick={() => setSpeech("formal")}
          >
            Formal
          </button>
          <button
            className={` ${
              speech === "casual" ? "bg-slate-900/40 text-white" : "bg-slate-700/20 text-white/45"
            } rounded-full px-10 py-4 text-4xl backdrop-blur-md transition-colors duration-500`}
            onClick={() => setSpeech("casual")}
          >
            Casual
          </button>
        </div>
        <div className="absolute top-full right-0 mt-20 flex flex-row gap-2">
          <button
            className={` ${
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
    </>
  );
};
