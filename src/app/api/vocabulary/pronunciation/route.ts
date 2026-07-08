import { createClient } from "@/lib/supabase/server";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { prisma } from "@/infrastructure/database/prisma";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { transcript, targetWord, wordId } = (await req.json()) as {
      transcript: string;
      targetWord: string;
      wordId: string;
    };

    if (!transcript || !targetWord) {
      return new Response("Transcript and Target Word are required", { status: 400 });
    }

    const systemPrompt = `You are an AI Pronunciation Coach.
    The user is trying to pronounce the word: "${targetWord}".
    The Speech-to-Text engine heard the user say: "${transcript}".
    Analyze how accurately the transcript matches the target word phonetically or conceptually if the STT engine misheard it slightly.
    Return a structured JSON output with a pronunciation score (0-100) and specific feedback.`;

    const result = await generateObject({
      model: openrouter("openai/gpt-4o-mini", { structuredOutputs: false }),
      system: systemPrompt,
      prompt: "Analyze the pronunciation.",
      schema: z.object({
        score: z.number().min(0).max(100).describe("Pronunciation accuracy score"),
        feedback: z
          .string()
          .describe("Constructive feedback on what was mispronounced, or encouragement if perfect"),
        mispronouncedSyllables: z
          .array(z.string())
          .describe("List of syllables or sounds they struggled with"),
      }),
    });

    // Optionally update mastery level based on score
    if (wordId && result.object.score > 80) {
      const userVocab = await prisma.userVocabulary.findUnique({
        where: { userId_wordId: { userId: user.id, wordId } },
      });
      if (userVocab && userVocab.masteryLevel < 5) {
        await prisma.userVocabulary.update({
          where: { id: userVocab.id },
          data: { masteryLevel: userVocab.masteryLevel + 1 },
        });
      }
    }

    return Response.json({ success: true, data: result.object });
  } catch (error) {
    console.error("Pronunciation Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
