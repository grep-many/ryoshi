import { NextRequest } from "next/server";
import * as googleTTS from "google-tts-api";
import { enforceApiSecurity, getEnvNumber, mergeHeaders } from "../_lib/security";

export async function GET(req: NextRequest) {
  const guard = enforceApiSecurity(req, {
    route: "tts",
    rateLimit: {
      max: getEnvNumber("TTS_RATE_LIMIT_MAX", 30),
      windowMs: getEnvNumber("TTS_RATE_LIMIT_WINDOW_MS", 60_000),
    },
  });

  if (guard) return guard;

  const { searchParams } = new URL(req.url);
  const text = (searchParams.get("text") || "").trim();
  const teacher = (searchParams.get("teacher") || "Nanami") as "Nanami" | "Naoki";
  const maxChars = getEnvNumber("TTS_MAX_CHARS", 300);

  if (!text) {
    return new Response("No text provided", {
      status: 400,
      headers: mergeHeaders(),
    });
  }

  if (text.length > maxChars) {
    return new Response("Text too long", {
      status: 413,
      headers: mergeHeaders(),
    });
  }

  if (teacher !== "Nanami" && teacher !== "Naoki") {
    return new Response("Invalid teacher", {
      status: 400,
      headers: mergeHeaders(),
    });
  }

  try {
    // 1. Get Google TTS URL (No API Key Required)
    // Google only provides one Japanese voice, so we fetch the same base audio
    const url = googleTTS.getAudioUrl(text, {
      lang: "ja",
      slow: false,
      host: "https://translate.google.com",
    });

    const timeoutMs = getEnvNumber("TTS_FETCH_TIMEOUT_MS", 8_000);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    let response: Response;
    try {
      response = await fetch(url, { signal: controller.signal });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return new Response("Upstream timeout", {
          status: 504,
          headers: mergeHeaders(),
        });
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
    if (!response.ok) throw new Error("Google TTS Fetch Failed");

    const audioBuffer = await response.arrayBuffer();

    // 2. Generate Visemes (Lip Sync Logic)
    const visemes: Array<[number, number]> = [];
    const characters = text.split("");
    let currentTime = 0;

    // Naoki (Male) usually speaks slightly slower in Japanese culture
    const timePerChar = teacher === "Naoki" ? 180 : 150;

    characters.forEach((char) => {
      let visemeId = 0;
      if (/[あかさたなはまやらわ]/.test(char)) visemeId = 1;
      else if (/[いきしちにひみり]/.test(char)) visemeId = 2;
      else if (/[うくすつぬふむゆる]/.test(char)) visemeId = 3;
      else if (/[えけせてねへめれ]/.test(char)) visemeId = 4;
      else if (/[おこそとのほもよろを]/.test(char)) visemeId = 5;

      if (visemeId !== 0) {
        visemes.push([currentTime, visemeId]);
        currentTime += timePerChar;
      } else {
        currentTime += timePerChar * 0.5;
      }
    });

    // 3. Return Response with Metadata
    return new Response(audioBuffer, {
      status: 200,
      headers: mergeHeaders({
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
        "X-Teacher-Gender": teacher === "Naoki" ? "male" : "female",
        Visemes: JSON.stringify(visemes),
        "Access-Control-Expose-Headers": "Visemes, X-Teacher-Gender",
      }),
    });
  } catch (error) {
    console.error("TTS Error:", error);
    return new Response("Internal Server Error", {
      status: 500,
      headers: mergeHeaders(),
    });
  }
}
