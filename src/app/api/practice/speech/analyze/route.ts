import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const systemPrompt = `You are an expert AI speech coach. 
You will be provided with a speech transcript from a student, along with the topic they were speaking about and the duration of their speech in seconds.
Analyze the speech and provide constructive, detailed feedback.
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

    // Use AI to analyze the speech
    const result = await generateObject({
      model: openrouter("openai/gpt-4o-mini", {
        structuredOutputs: false, // OpenRouter sometimes struggles with strict structured outputs, we rely on ai sdk parsing
      }),
      system: systemPrompt,
      prompt: `Topic: ${targetText}\nDuration: ${durationSeconds} seconds\nTranscript: "${transcript}"`,
      schema: z.object({
        grammarScore: z
          .number()
          .min(0)
          .max(100)
          .describe("Score out of 100 for grammatical correctness"),
        fluencyScore: z
          .number()
          .min(0)
          .max(100)
          .describe("Score out of 100 for flow, hesitations, and pacing"),
        pronunciationScore: z
          .number()
          .min(0)
          .max(100)
          .describe("Score out of 100 for clarity based on transcript interpretation"),
        vocabularyScore: z
          .number()
          .min(0)
          .max(100)
          .describe("Score out of 100 for word choice and variety"),
        confidenceScore: z
          .number()
          .min(0)
          .max(100)
          .describe("Score out of 100 representing perceived confidence"),
        speakingSpeedWpm: z
          .number()
          .describe("Estimated Words Per Minute (WPM) based on duration and transcript length"),
        speakingPace: z.string().describe("E.g., 'Too fast', 'Just right', 'Too slow'"),
        pauseAnalysis: z
          .string()
          .describe(
            "Feedback on their use of pauses (e.g., 'Good use of pauses', 'Too many long pauses')"
          ),
        fillerWords: z
          .array(z.string())
          .describe("List of filler words detected in the transcript (e.g., 'um', 'like', 'uh')"),
        overallScore: z
          .number()
          .min(0)
          .max(100)
          .describe("Overall average or weighted score out of 100"),
        strengths: z.array(z.string()).describe("2-3 positive aspects of the speech"),
        areasForImprovement: z.array(z.string()).describe("2-3 specific areas to improve"),
        correctedVersion: z
          .string()
          .describe("A grammatically correct and polished version of their transcript"),
        betterVocabularySuggestions: z
          .array(
            z.object({
              original: z.string(),
              suggestion: z.string(),
              reason: z.string(),
            })
          )
          .describe("Suggestions for replacing basic words with better alternatives"),
        pronunciationTips: z
          .array(z.string())
          .describe("Tips for pronouncing difficult words found in the transcript"),
        practiceRecommendations: z
          .array(z.string())
          .describe("Specific exercises to improve their weaknesses"),
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
      const newSpeakingScore = (progress.speakingScore + aiFeedback.overallScore) / 2;
      const newOverallScore = (progress.overallScore + aiFeedback.overallScore) / 2;

      await prisma.progress.update({
        where: { userId: user.id },
        data: {
          totalPracticeTime: newTotalTime,
          speakingScore: newSpeakingScore,
          overallScore: newOverallScore,
        },
      });
    }

    return new Response(JSON.stringify({ attemptId: attempt.id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Speech Analysis Error:", error);
    return new Response(JSON.stringify({ error: "Analysis failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
