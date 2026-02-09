import { TeacherOpt } from "@/components";
import { create } from "zustand";

// --- Interfaces ---

export interface JapaneseWord {
  map: any;
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
  speech?: string;
  audioPlayer?: HTMLAudioElement | null;
  visemes?: any; // Replace 'any' with your specific viseme type if known
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
        audioPlayer: null, // New teacher, new Voice
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
      // Ask AI
      const res = await fetch(`/api/ai?question=${encodeURIComponent(question)}&speech=${speech}`);
      const data: AIResponse = await res.json();

      const message: Message = {
        question,
        id: newMessageId,
        answer: data,
        speech: speech,
      };

      set((state) => ({
        currentMessage: message,
        messages: [...state.messages, message],
        loading: false,
      }));

      get().playMessage(message);
    } catch (error) {
      console.error("AI Request failed:", error);
      set({ loading: false });
    }
  },

  playMessage: async (message: Message) => {
    set({ currentMessage: message });

    if (!message.audioPlayer && message.answer) {
      set({ loading: true });

      try {
        const japaneseText = message.answer.japanese.map((word) => word.word).join(" ");
        const audioRes = await fetch(
          `/api/tts?teacher=${get().teacher}&text=${encodeURIComponent(japaneseText)}`,
        );

        const audioBlob = await audioRes.blob();
        const visemesHeader = audioRes.headers.get("visemes");
        const visemes = visemesHeader ? JSON.parse(visemesHeader) : null;

        const audioUrl = URL.createObjectURL(audioBlob);
        const audioPlayer = new Audio(audioUrl);

        message.visemes = visemes;
        message.audioPlayer = audioPlayer;

        message.audioPlayer.onended = () => {
          set({ currentMessage: null });
        };

        set((state) => ({
          loading: false,
          messages: state.messages.map((m) => (m.id === message.id ? message : m)),
        }));
      } catch (error) {
        console.error("TTS Request failed:", error);
        set({ loading: false });
        return;
      }
    }

    if (message.audioPlayer) {
      message.audioPlayer.currentTime = 0;
      message.audioPlayer.play();
    }
  },

  stopMessage: (message: Message) => {
    message.audioPlayer?.pause();
    set({ currentMessage: null });
  },
}));
