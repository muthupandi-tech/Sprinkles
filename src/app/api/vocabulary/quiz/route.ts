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

    const { action, score, totalQuestions, quizData } = (await req.json()) as any;

    if (action === "submit") {
      // User is submitting a completed quiz to save the score
      const attempt = await prisma.vocabularyQuizAttempt.create({
        data: {
          userId: user.id,
          score,
          totalQuestions,
          quizData: quizData || {},
        },
      });

      // Update global progress
      const progress = await prisma.progress.findUnique({ where: { userId: user.id } });
      if (progress) {
        const newScore = (progress.vocabularyScore + (score / totalQuestions) * 100) / 2;
        await prisma.progress.update({
          where: { userId: user.id },
          data: { vocabularyScore: newScore },
        });
      }

      // Update Mastery Level of words
      // Assuming quizData contains { wordId: correct(boolean) }
      if (quizData && Array.isArray(quizData.answers)) {
        for (const answer of quizData.answers) {
          const userVocab = await prisma.userVocabulary.findUnique({
            where: { userId_wordId: { userId: user.id, wordId: answer.wordId } },
          });
          if (userVocab) {
            const newMastery = answer.correct
              ? Math.min(5, userVocab.masteryLevel + 1)
              : Math.max(0, userVocab.masteryLevel - 1);

            await prisma.userVocabulary.update({
              where: { id: userVocab.id },
              data: { masteryLevel: newMastery },
            });
          }
        }
      }

      return Response.json({ success: true, attemptId: attempt.id });
    }

    // Otherwise, Generate a Quiz
    // Fetch user's vocabulary words
    const userVocabs = await prisma.userVocabulary.findMany({
      where: { userId: user.id },
      include: { word: true },
      take: 20, // take a pool of up to 20 words
      orderBy: { nextReviewAt: "asc" },
    });

    if (userVocabs.length < 3) {
      return new Response(
        JSON.stringify({
          error: "Not enough vocabulary words to generate a quiz. Learn more words first!",
        }),
        { status: 400 }
      );
    }

    const wordsPool = userVocabs.map((uv) => ({
      id: uv.wordId,
      word: uv.word.word,
      meaning: uv.word.meaning,
    }));

    const systemPrompt = `You are an expert English teacher creating a 5-question vocabulary quiz.
    The student has learned the following words: ${JSON.stringify(wordsPool)}.
    Create a quiz using ONLY these words.
    Include a mix of 'multiple_choice', 'fill_in_the_blank', and 'matching'.
    Return the quiz as a structured JSON object.`;

    const result = await generateObject({
      model: openrouter("openai/gpt-4o-mini", { structuredOutputs: false }),
      system: systemPrompt,
      prompt: "Generate the vocabulary quiz.",
      schema: z.object({
        questions: z
          .array(
            z.object({
              type: z.enum(["multiple_choice", "fill_in_the_blank", "matching"]),
              question: z.string().describe("The question text or sentence with a blank"),
              options: z
                .array(z.string())
                .optional()
                .describe("For multiple choice or matching, the available options to choose from"),
              answer: z
                .string()
                .describe(
                  "The correct answer exactly as it appears in the options or the exact word for fill_in_the_blank"
                ),
              wordId: z.string().describe("The ID of the target vocabulary word being tested"),
            })
          )
          .length(5),
      }),
    });

    return Response.json({ success: true, quiz: result.object });
  } catch (error) {
    console.error("Quiz Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
