import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

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

    const progress = await prisma.progress.findUnique({
      where: { userId: user.id }
    });

    const { text } = await generateText({
      model: openrouter("openai/gpt-4o-mini"),
      system: `You are an encouraging AI coach for an English communication app.
Write ONE short, personalized, highly motivational sentence for the student.
Current Stats:
- Streak: ${progress?.currentStreak} days
- Overall Score: ${progress?.overallScore}%
- Speaking: ${progress?.speakingScore}%
- Vocab: ${progress?.vocabularyScore}%
- Pronunciation: ${progress?.pronunciationScore}%

Make it specific, positive, and direct. E.g., "Your pronunciation improved this week. Keep up the 3-day streak!"`,
      prompt: "Generate a short motivational message."
    });

    return Response.json({ success: true, message: text });
  } catch (error) {
    console.error("Motivation GET Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
