import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const systemPrompt = `You are an expert AI speech and pronunciation coach. 
You will be provided with a speech transcript from a student reading a specific pronunciation drill text, along with the duration of their speech.
Analyze the speech and provide constructive, detailed feedback on their pronunciation, accent clarity, phonemes, and enunciation.
You must return your analysis as a structured JSON object.`;

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

    const { transcript, targetText, durationSeconds } = (await req.json()) as {
      transcript: string;
      targetText: string;
      durationSeconds: number;
    };

    if (!transcript) {
      return new Response("Transcript is required", { status: 400 });
    }

    // Use AI to analyze the pronunciation
    const result = await generateObject({
      model: openrouter("openai/gpt-4o-mini", {
        structuredOutputs: false,
      }),
      system: systemPrompt,
      prompt: `Drill Text: ${targetText}\nDuration: ${durationSeconds} seconds\nTranscript: "${transcript}"`,
      schema: z.object({
        pronunciationScore: z
          .number()
          .min(0)
          .max(100)
          .describe("Score out of 100 for pronunciation clarity and accuracy"),
        fluencyScore: z
          .number()
          .min(0)
          .max(100)
          .describe("Score out of 100 for flow, hesitations, and pacing"),
        speakingSpeedWpm: z
          .number()
          .describe("Estimated Words Per Minute (WPM) based on duration and transcript length"),
        speakingPace: z.string().describe("E.g., 'Too fast', 'Just right', 'Too slow'"),
        overallScore: z
          .number()
          .min(0)
          .max(100)
          .describe("Overall average or weighted score out of 100 for this drill"),
        strengths: z.array(z.string()).describe("2-3 positive aspects of their pronunciation"),
        areasForImprovement: z.array(z.string()).describe("2-3 specific areas to improve"),
        mispronouncedWords: z
          .array(
            z.object({
              word: z.string(),
              ipa: z.string().describe("International Phonetic Alphabet representation of the correct pronunciation"),
              tip: z.string().describe("Tip on how to pronounce this correctly"),
            })
          )
          .describe("Words from the drill text that were likely mispronounced based on the transcript"),
        phonemeFeedback: z
          .array(z.string())
          .describe("Specific feedback on consonant pairs or vowels (e.g., 'V' vs 'W', 'Th')"),
      }),
    });

    const aiFeedback = result.object;

    // Save to database
    const attempt = await prisma.speechAttempt.create({
      data: {
        userId: user.id,
        transcription: transcript,
        targetText: targetText,
        durationSeconds: durationSeconds,
        pronunciationScore: aiFeedback.pronunciationScore,
        fluencyScore: aiFeedback.fluencyScore,
        feedbackJson: aiFeedback as any,
      },
    });

    // Update global progress
    const progress = await prisma.progress.findUnique({ where: { userId: user.id } });
    if (progress) {
      const newTotalTime = progress.totalPracticeTime + Math.ceil(durationSeconds / 60);
      const newPronunciationScore = (progress.pronunciationScore + aiFeedback.pronunciationScore) / 2;
      const newOverallScore = (progress.overallScore + aiFeedback.overallScore) / 2;

      await prisma.progress.update({
        where: { userId: user.id },
        data: {
          totalPracticeTime: newTotalTime,
          pronunciationScore: newPronunciationScore,
          overallScore: newOverallScore,
        },
      });
    }

    return new Response(JSON.stringify({ attemptId: attempt.id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Pronunciation Analysis Error:", error);
    return new Response(JSON.stringify({ error: "Analysis failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
