import { NextRequest, NextResponse } from "next/server";
import { enforceApiSecurity, getEnvNumber, mergeHeaders } from "../_lib/security";

/**
 * ARCHITECT: Converts AI pipe-string to the complex Frontend JSON structure.
 * This takes the simple string and builds the nested object you need.
 */
function buildJsonFromPipe(rawContent: string, originalQuestion: string) {
  const sections = rawContent.split("|").map((s) => s.trim());
  if (sections.length < 3) throw new Error("AI output incomplete");

  const [english, japaneseRaw, chunksRaw] = sections;

  // 1. Root Japanese Array (for the main display)
  const japaneseArray = japaneseRaw.split(",").map((pair) => {
    const parts = pair.split(":").map((s) => s.trim());
    return {
      word: parts[0] || "",
      reading: parts[1] || "",
    };
  });

  // 2. Grammar Chunks Array (for the detailed breakdown)
  const chunksArray = chunksRaw.split(",").map((c) => {
    const parts = c.split(":").map((s) => s.trim());
    return {
      japanese: [{ word: parts[0] || "", reading: "" }],
      meaning: parts[1] || "",
      grammar: parts[2] || "",
    };
  });

  // Match the exact format of your formalExample / casualExample
  return {
    japanese: japaneseArray,
    grammarBreakdown: [
      {
        english: english || originalQuestion,
        japanese: japaneseArray,
        chunks: chunksArray,
      },
    ],
  };
}

export async function GET(req: NextRequest) {
  const guard = enforceApiSecurity(req, {
    route: "ai",
    rateLimit: {
      max: getEnvNumber("AI_RATE_LIMIT_MAX", 20),
      windowMs: getEnvNumber("AI_RATE_LIMIT_WINDOW_MS", 60_000),
    },
  });

  if (guard) return guard;

  const { searchParams } = new URL(req.url);
  const question = (searchParams.get("question") || "").trim();
  const speech = (searchParams.get("speech") || "formal").trim();
  const maxChars = getEnvNumber("AI_MAX_CHARS", 200);

  if (!question) {
    return NextResponse.json(
      { error: "Question required" },
      { status: 400, headers: mergeHeaders() },
    );
  }

  if (question.length > maxChars) {
    return NextResponse.json(
      { error: "Question too long" },
      { status: 413, headers: mergeHeaders() },
    );
  }

  if (question.includes("|")) {
    return NextResponse.json(
      { error: "Invalid characters in question" },
      { status: 400, headers: mergeHeaders() },
    );
  }

  if (speech !== "formal" && speech !== "casual") {
    return NextResponse.json(
      { error: "Invalid speech style" },
      { status: 400, headers: mergeHeaders() },
    );
  }

  if (!process.env.AI_SERVER_URL || !process.env.AI_SERVER_KEY) {
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500, headers: mergeHeaders() },
    );
  }

  /**
   * REFINED PROMPT:
   * 1. We specify "High Accuracy"
   * 2. We provide a "Speech Style" context more clearly
   * 3. We use a more realistic Japanese example
   */
  const prompt = `Japanese Translation Database. 
Accuracy: High.
Style: ${speech}.

Example: "Do you eat?" | 食べますか:たべますか | 食べます:to eat:Verb, か:?:Particle
Input: "${question}"
Result: ${question} |`;

  try {
    const controller = new AbortController();
    let response: Response;
    try {
      response = await fetch(process.env.AI_SERVER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.AI_SERVER_KEY}`,
        },
        body: JSON.stringify({
          prompt: prompt,
          model: "teacher",
          n_predict: 200,
          temperature: 0.1, // Keep it low for accuracy
          top_p: 0.9, // Allow for some natural word choice
          stop: ["\n", "Input:", "Example:"],
          grammar: `root ::= section "|" section\nsection ::= [^|\\n]+`,
        }),
        signal: controller.signal,
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return NextResponse.json(
          { error: "Upstream timeout" },
          { status: 504, headers: mergeHeaders() },
        );
      }
      throw error;
    }

    if (!response.ok) throw new Error("AI server is not responding");
    const data = await response.json();
    const aiRaw = `${question} | ` + data.content.trim();

    return NextResponse.json(buildJsonFromPipe(aiRaw, question), {
      headers: mergeHeaders(),
    });
  } catch (error: any) {
    console.error("Next.js AI Route Error:", error.message);
    return NextResponse.json(
      { error: "Translation error" },
      { status: 500, headers: mergeHeaders() },
    );
  }
}
