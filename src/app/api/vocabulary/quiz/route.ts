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

    // Generate a Quiz
    const userVocabs = await prisma.userVocabulary.findMany({
      where: { userId: user.id },
      include: { word: true },
      take: 20,
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
      wordId: uv.wordId,
      word: uv.word.word,
      meaning: uv.word.meaning,
      difficulty: uv.word.difficultyLevel,
      category: uv.word.partOfSpeech,
    }));

    const systemPrompt = `You are an expert English teacher creating a 5-question vocabulary quiz.
The student has learned the following words: ${JSON.stringify(wordsPool)}.
Create a quiz using ONLY these words.
Include a mix of 'multiple_choice', 'fill_in_the_blank', and 'matching'.
CRITICAL RULES:
1. You MUST return ONLY valid JSON matching the exact schema. No markdown formatting (\`\`\`json) or extra text.
2. EVERY question MUST include the 'wordId' of the target vocabulary word from the provided list. NEVER leave 'wordId' null or undefined.
3. EVERY question MUST include the 'difficulty' and 'category' exactly as provided in the words list.`;

    try {
      console.log("Generating AI Quiz for user", user.id);
      const result = await generateObject({
        model: openrouter("openai/gpt-4o-mini", { structuredOutputs: false }),
        system: systemPrompt,
        prompt: "Generate the vocabulary quiz. Remember to strictly include wordId, difficulty, and category for every question.",
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
                wordId: z.string().describe("CRITICAL: The exact ID string of the target vocabulary word from the provided words list"),
                difficulty: z.string().describe("The difficulty level of the word from the provided list"),
                category: z.string().describe("The category (part of speech) of the word from the provided list"),
              })
            )
            .min(3)
            .max(10),
        }),
      });

      console.log("AI Quiz generated successfully.");
      
      // Auto-recovery / Validation check
      const questions = result.object.questions.map((q, index) => {
        if (!q.wordId) {
          console.warn(`[Auto-Recovery] Question ${index} is missing wordId. Attempting to repair...`);
          // Try to match the answer string to the wordsPool
          const matchedWord = wordsPool.find(w => 
            q.answer.toLowerCase().includes(w.word.toLowerCase()) || 
            q.question.toLowerCase().includes(w.word.toLowerCase())
          );
          if (matchedWord) {
            console.log(`[Auto-Recovery] Repaired missing wordId with ${matchedWord.wordId}`);
            q.wordId = matchedWord.wordId;
            if (!q.difficulty) q.difficulty = matchedWord.difficulty;
            if (!q.category) q.category = matchedWord.category;
          } else {
             // If completely unmatched, grab a random one to prevent strict crash
             console.warn(`[Auto-Recovery] Could not match word for question ${index}. Using fallback word.`);
             q.wordId = wordsPool[0].wordId;
          }
        }
        return q;
      });

      return Response.json({ success: true, quiz: { questions } });
      
    } catch (aiError: any) {
      console.error("AI Quiz Generation Failed:", aiError.message);
      
      // Local Fallback Generator
      console.log("Using Local Fallback Generator...");
      
      // Shuffle words pool
      const shuffled = [...wordsPool].sort(() => 0.5 - Math.random());
      const selectedWords = shuffled.slice(0, Math.min(5, shuffled.length));
      
      const fallbackQuestions = selectedWords.map(target => {
        // Create a simple multiple choice question
        const options = [target.word];
        while (options.length < 4 && options.length < wordsPool.length) {
          const randomWord = wordsPool[Math.floor(Math.random() * wordsPool.length)].word;
          if (!options.includes(randomWord)) {
            options.push(randomWord);
          }
        }
        
        return {
          type: "multiple_choice",
          question: `What is the word that means: "${target.meaning}"?`,
          options: options.sort(() => 0.5 - Math.random()), // shuffle options
          answer: target.word,
          wordId: target.wordId,
          difficulty: target.difficulty,
          category: target.category
        };
      });

      return Response.json({ success: true, quiz: { questions: fallbackQuestions }, isFallback: true });
    }
  } catch (error: any) {
    console.error("Quiz Route Fatal Error:", error);
    // Don't expose stack traces to client
    return new Response(JSON.stringify({ error: "Failed to generate or submit quiz. Please try again later." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
