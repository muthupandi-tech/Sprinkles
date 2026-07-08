import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { conversationId } = await params;

    // Fetch conversation and messages
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId, userId: user.id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!conversation) {
      return new Response("Conversation not found", { status: 404 });
    }

    if (conversation.messages.length < 2) {
      return new Response("Not enough messages to generate feedback", { status: 400 });
    }

    // Format chat history
    const chatHistory = conversation.messages
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n\n");

    const { object } = await generateObject({
      model: openrouter("openai/gpt-4o-mini"),
      system: `You are an expert English communication coach evaluating a conversation.
Based on the provided conversation history between the user and the coach, provide 4 pieces of feedback for the user:
1. One new vocabulary word to learn that fits their context.
2. One grammar correction based on their mistakes.
3. One general communication tip.
4. A daily challenge to help them practice.`,
      prompt: `Conversation History:\n${chatHistory}`,
      schema: z.object({
        vocabulary: z.string().describe("A vocabulary word to learn, with its definition."),
        grammar: z
          .string()
          .describe(
            "A specific grammar correction pointing out a mistake and showing the correct way."
          ),
        tip: z.string().describe("A short communication tip."),
        challenge: z.string().describe("A daily speaking or communication challenge for the user."),
      }),
    });

    const suggestionsToCreate = [
      { type: "vocabulary", content: object.vocabulary },
      { type: "grammar", content: object.grammar },
      { type: "tip", content: object.tip },
      { type: "challenge", content: object.challenge },
    ].map((s) => ({
      userId: user.id,
      conversationId: conversation.id,
      type: s.type,
      content: s.content,
    }));

    await prisma.coachSuggestion.createMany({
      data: suggestionsToCreate,
    });

    const createdSuggestions = await prisma.coachSuggestion.findMany({
      where: { conversationId: conversation.id },
    });

    return Response.json({ success: true, suggestions: createdSuggestions });
  } catch (error) {
    console.error("Suggestions Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
