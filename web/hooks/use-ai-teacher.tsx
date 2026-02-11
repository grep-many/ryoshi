import { TeacherOpt } from "@/components/teacher"; // Ensure this matches your teacher component export
import { create } from "zustand";

// --- Interfaces ---

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

    if (!message.audioPlayer && message.answer) {
      set({ loading: true });

      try {
        const japaneseText = message.answer.japanese.map((word) => word.word).join("");
        const audioRes = await fetch(
          `/api/tts?teacher=${get().teacher}&text=${encodeURIComponent(japaneseText)}`,
        );

        const audioBlob = await audioRes.blob();
        const visemesHeader = audioRes.headers.get("visemes");
        const visemes = visemesHeader ? JSON.parse(visemesHeader) : [];

        const audioUrl = URL.createObjectURL(audioBlob);
        const audioPlayer = new Audio(audioUrl);

        message.visemes = visemes;
        message.audioPlayer = audioPlayer;

        message.audioPlayer.onended = () => {
          set({ currentMessage: null });
        };

        // Update the specific message in the list with its new audioPlayer
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