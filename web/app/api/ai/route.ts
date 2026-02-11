/**
 * ARCHITECT: Converts AI pipe-string to the complex Frontend JSON structure.
 * This takes the simple string and builds the nested object you need.
 */
function buildJsonFromPipe(rawContent, originalQuestion) {
  const sections = rawContent.split('|').map(s => s.trim());
  if (sections.length < 3) throw new Error('AI output incomplete');

  const [english, japaneseRaw, chunksRaw] = sections;

  // 1. Root Japanese Array (for the main display)
  const japaneseArray = japaneseRaw.split(',').map(pair => {
    const parts = pair.split(':').map(s => s.trim());
    return { 
      word: parts[0] || "", 
      reading: parts[1] || "" 
    };
  });

  // 2. Grammar Chunks Array (for the detailed breakdown)
  const chunksArray = chunksRaw.split(',').map(c => {
    const parts = c.split(':').map(s => s.trim());
    return {
      japanese: [{ word: parts[0] || "", reading: "" }],
      meaning: parts[1] || "",
      grammar: parts[2] || ""
    };
  });

  // Match the exact format of your formalExample / casualExample
  return {
    japanese: japaneseArray,
    grammarBreakdown: [{
      english: english || originalQuestion,
      japanese: japaneseArray,
      chunks: chunksArray
    }]
  };
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const question = searchParams.get("question") || "Where is the hospital?";
  const speech = searchParams.get("speech") || "formal";

  // Position-based prompt for 1.5B/0.5B models
  const prompt = `Task: Translate to ${speech} Japanese.
Example: Hello | こんにちは:konnichiwa | こんにちは:Hello:Greeting
Input: "${question}"
Result: ${question} |`;

  try {
    const response = await fetch('http://127.0.0.1:8080/completion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: prompt,
        n_predict: 256,
        temperature: 0.1,
        stop: ["\n", "Input:"],
        // Strict grammar prevents the model from rambling
        grammar: `root ::= section "|" section\nsection ::= [^|\\n]+`
      })
    });

    if (!response.ok) throw new Error('Local AI server is not responding');

    const data = await response.json();
    
    // Reconstruct: Forced English | AI Japanese | AI Grammar
    const aiRaw = `${question} | ` + data.content.trim();
    
    const finalData = buildJsonFromPipe(aiRaw, question);

    return Response.json(finalData);

  } catch (error) {
    console.error("Next.js AI Route Error:", error.message);
    
    // Safety Fallback: Return a 500 or a simplified error object
    return Response.json(
      { error: "The translator is resting. Try again in a moment." }, 
      { status: 500 }
    );
  }
}