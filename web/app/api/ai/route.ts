import { openai } from "@/config/openai";
import { casualExample, formalExample } from "@/constants";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const speech = req.nextUrl.searchParams.get("speech") || "formal";
  const speechExample = speech === "formal" ? formalExample : casualExample;

  const chatCompletion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You are a Japanese language teacher. 
  Your student asks you how to say something from english to japanese.
  You should respond with: 
  - english: the english version ex: "Do you live in Japan?"
  - japanese: the japanese translation in split into words ex: ${JSON.stringify(
    speechExample.japanese,
  )}
  - grammarBreakdown: an explanation of the grammar structure per sentence ex: ${JSON.stringify(
    speechExample.grammarBreakdown,
  )}
  `,
      },
      {
        role: "system",
        content: `You always respond with a JSON object with the following format: 
          {
            "english": "",
            "japanese": [{
              "word": "",
              "reading": ""
            }],
            "grammarBreakdown": [{
              "english": "",
              "japanese": [{
                "word": "",
                "reading": ""
              }],
              "chunks": [{
                "japanese": [{
                  "word": "",
                  "reading": ""
                }],
                "meaning": "",
                "grammar": ""
              }]
            }]
          }`,
      },
      {
        role: "user",
        content: `How to say ${
          req.nextUrl.searchParams.get("question") || "Have you ever been to Japan?"
        } in Japanese in ${speech} speech?`,
      },
    ],
    // model: "gpt-4-turbo-preview", // https://platform.openai.com/docs/models/gpt-4-and-gpt-4-turbo
    // model: "gpt-3.5-turbo", // https://help.openai.com/en/articles/7102672-how-can-i-access-gpt-4
    model: "teacher.gguf", // https://help.openai.com/en/articles/7102672-how-can-i-access-gpt-4
    response_format: {
      type: "json_object",
    },
    max_completion_tokens:400
  });

  if (!chatCompletion.choices[0].message.content)
    throw new Error("Something went wrong while generating response!");
  console.log(chatCompletion.choices[0].message.content);
  return Response.json(JSON.parse(chatCompletion.choices[0].message.content));
}
