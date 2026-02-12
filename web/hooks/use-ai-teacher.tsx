import { create } from "zustand";

// --- Interfaces ---

export type TeacherOpt = "Nanami"|"Naoki"

export interface JapaneseWord {
  word: string;
  reading?: string;
}

export interface GrammarChunk {
  japanese: JapaneseWord[];
  meaning: string;
  grammar: string;
}

export interface GrammarBreakdown {
  english: string;
  japanese: JapaneseWord[];
  chunks: GrammarChunk[];
}

export interface AIResponse {
  english: string;
  japanese: JapaneseWord[];
  grammarBreakdown: GrammarBreakdown[];
}

export interface Message {
  id: number;
  question: string;
  answer?: AIResponse;
  speech?: SpeechType;
  audioPlayer?: HTMLAudioElement | null;
  visemes?: any; // Ideally [number, number][] based on Azure/AWS TTS standards
}

export type SpeechType = "formal" | "casual";
export type ClassRoomType = "default" | "alternative";

interface AITeacherState {
  messages: Message[];
  currentMessage: Message | null;
  teacher: TeacherOpt;
  classroom: ClassRoomType;
  loading: boolean;
  furigana: boolean;
  english: boolean;
  speech: SpeechType;

  // Actions
  setTeacher: (teacher: TeacherOpt) => void;
  setClassroom: (classroom: ClassRoomType) => void;
  setFurigana: (furigana: boolean) => void;
  setEnglish: (english: boolean) => void;
  setSpeech: (speech: SpeechType) => void;
  askAI: (question: string) => Promise<void>;
  playMessage: (message: Message) => Promise<void>;
  stopMessage: (message: Message) => void;
}

// --- Store ---

export const teachers: TeacherOpt[] = ["Nanami", "Naoki"];

export const useAITeacher = create<AITeacherState>((set, get) => ({
  messages: [],
  currentMessage: null,
  teacher: teachers[0],
  classroom: "default",
  loading: false,
  furigana: true,
  english: true,
  speech: "formal",

  setTeacher: (teacher) => {
    set((state) => ({
      teacher,
      messages: state.messages.map((message) => ({
        ...message,
        audioPlayer: null, // Reset audio player for new teacher voice
      })),
    }));
  },

  setClassroom: (classroom) => set({ classroom }),
  setFurigana: (furigana) => set({ furigana }),
  setEnglish: (english) => set({ english }),
  setSpeech: (speech) => set({ speech }),

  askAI: async (question: string) => {
    if (!question) return;

    const newMessageId = get().messages.length;
    set({ loading: true });

    const speech = get().speech;

    try {
      const res = await fetch(`/api/ai?question=${encodeURIComponent(question)}&speech=${speech}`);
      const data: AIResponse = await res.json();

      const message: Message = {
        question,
        id: newMessageId,
        answer: data,
        speech: speech,
      };

      set((state) => ({
        messages: [...state.messages, message],
        currentMessage: message,
      }));

      // We don't set loading false here because playMessage handles the next loading state
      get().playMessage(message);
    } catch (error) {
      console.error("AI Request failed:", error);
      set({ loading: false });
    }
  },

  playMessage: async (message: Message) => {
    set({ currentMessage: message });

    if (!message.visemes && message.answer) {
      set({ loading: true });
      try {
        const japaneseText = message.answer.japanese?.map((word) => word.word).join("");
        const audioRes = await fetch(
          `/api/tts?teacher=${get().teacher}&text=${encodeURIComponent(japaneseText)}`,
        );

        const arrayBuffer = await audioRes.arrayBuffer();
        const visemes = JSON.parse(audioRes.headers.get("visemes") || "[]");

        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

        const playAudio = async () => {
          const source = audioContext.createBufferSource();
          source.buffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));

          if (get().teacher === "Naoki") {
            source.detune.value = -700;
          }

          source.connect(audioContext.destination);

          // Capture the exact moment playback starts
          (message as any).audioContext = audioContext;
          (message as any).startTime = audioContext.currentTime;
          message.visemes = visemes;

          source.start(0);
          source.onended = () => set({ currentMessage: null });
          (message as any).activeSource = source;
        };

        (message as any).playInternal = playAudio;
        await playAudio();
        set({ loading: false });
      } catch (e) {
        set({ loading: false });
      }
    } else if ((message as any).playInternal) {
      await (message as any).playInternal();
    }
  },

  stopMessage: (message: Message) => {
    // If using Web Audio API, we stop the source node
    if ((message as any).activeSource) {
      try {
        (message as any).activeSource.stop();
      } catch (e) {
        // Source might already be stopped
      }
    }
    set({ currentMessage: null });
  },
}));
