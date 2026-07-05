import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const profile = await prisma.studentProfile.findUnique({
      where: { userId: user.id },
    });

    const proficiency = profile?.englishProficiency || "Intermediate";
    const careerGoal = profile?.careerGoal || "Software Engineering";

    // 1. Get today's beginning
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // 2. See if the user already has 5 words for today
    let todaysVocab = await prisma.userVocabulary.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: startOfToday },
      },
      include: { word: true },
    });

    if (todaysVocab.length >= 5) {
      return Response.json({ success: true, data: todaysVocab.map(v => v.word) });
    }

    // 3. Need to generate new words
    const neededCount = 5 - todaysVocab.length;

    // To prevent generating duplicates, get all existing words for this user
    const existingVocab = await prisma.userVocabulary.findMany({
      where: { userId: user.id },
      select: { word: { select: { word: true } } },
    });
    const existingWords = existingVocab.map((v) => v.word.word);

    const systemPrompt = `You are an expert English Vocabulary Coach for professionals. 
    You are generating vocabulary words for a student whose proficiency level is ${proficiency} and whose career goal is ${careerGoal}.
    Generate exactly ${neededCount} new vocabulary words that are highly relevant to their career or communication skills.
    DO NOT include these words as they already know them: ${existingWords.join(", ")}.
    Return the result as a structured JSON object containing an array of "words".`;

    const result = await generateObject({
      model: openrouter("openai/gpt-4o-mini", { structuredOutputs: false }),
      system: systemPrompt,
      prompt: "Generate the daily vocabulary words.",
      schema: z.object({
        words: z.array(z.object({
          word: z.string(),
          meaning: z.string(),
          pronunciation: z.string(),
          partOfSpeech: z.string(),
          synonyms: z.array(z.string()),
          antonyms: z.array(z.string()),
          exampleSentence: z.string(),
          interviewExample: z.string().describe("An example sentence of how to use this word in a job interview"),
        })).length(neededCount),
      }),
    });

    const newWords = result.object.words;

    // 4. Save to database
    for (const wordData of newWords) {
      // Create or find the global VocabularyWord
      const word = await prisma.vocabularyWord.upsert({
        where: { word: wordData.word },
        update: {},
        create: {
          word: wordData.word,
          meaning: wordData.meaning,
          pronunciation: wordData.pronunciation,
          partOfSpeech: wordData.partOfSpeech,
          synonyms: wordData.synonyms,
          antonyms: wordData.antonyms,
          exampleSentence: wordData.exampleSentence,
          interviewExample: wordData.interviewExample,
          difficultyLevel: proficiency,
        },
      });

      // Link to User
      await prisma.userVocabulary.upsert({
        where: {
          userId_wordId: {
            userId: user.id,
            wordId: word.id,
          },
        },
        update: {},
        create: {
          userId: user.id,
          wordId: word.id,
          nextReviewAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Next day
        },
      });
    }

    // 5. Fetch again to return
    todaysVocab = await prisma.userVocabulary.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: startOfToday },
      },
      include: { word: true },
    });

    return Response.json({ success: true, data: todaysVocab.map(v => v.word) });

  } catch (error) {
    console.error("Daily Vocabulary Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
