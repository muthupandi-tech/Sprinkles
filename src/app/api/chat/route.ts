import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const systemPrompt = `You are Sprinkles, an AI communication coach and personal mentor.
Your personality is friendly, motivating, professional, patient, and career-focused.
- Never give one-word answers.
- Always explain concepts clearly.
- Encourage students to improve communication skills.
- Assist with spoken English, grammar, vocabulary, pronunciation, interviews, public speaking, group discussions, resume explanations, and presentation skills.`;

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

    const profile = await prisma.studentProfile.findUnique({
      where: { userId: user.id },
    });

    const dynamicSystemPrompt = `${systemPrompt}\n\nUser Context:\n- Name: ${profile?.fullName || "Student"}\n- English Level: ${profile?.englishProficiency || "Beginner"}\n- Preferred Accent: ${profile?.preferredAccent || "American"}\n- Target Career/Company: ${profile?.careerGoal || "Not specified"} at ${profile?.targetCompany || "Not specified"}`;

    const { messages, conversationId } = (await req.json()) as {
      messages: { role: string; content: string }[];
      conversationId?: string;
    };

    let currentConversationId = conversationId;

    // Create a conversation if this is a new one
    if (!currentConversationId) {
      const firstMessageContent = messages.find((m) => m.role === "user")?.content || "New Chat";
      const title =
        firstMessageContent.length > 30
          ? firstMessageContent.substring(0, 30) + "..."
          : firstMessageContent;

      const newConversation = await prisma.conversation.create({
        data: {
          userId: user.id,
          title: title,
        },
      });
      currentConversationId = newConversation.id;
    }

    // Identify the latest user message
    const latestMessage = messages[messages.length - 1];

    // Save user message
    if (latestMessage.role === "user") {
      await prisma.message.create({
        data: {
          conversationId: currentConversationId,
          userId: user.id,
          role: "user",
          content: latestMessage.content,
        },
      });
    }

    const result = await streamText({
      model: openrouter("openai/gpt-4o-mini"),
      system: dynamicSystemPrompt,
      messages: messages as any,
      async onFinish({ text }) {
        await prisma.message.create({
          data: {
            conversationId: currentConversationId!,
            userId: user.id,
            role: "assistant",
            content: text,
          },
        });
      },
    });

    return result.toTextStreamResponse({
      headers: {
        "x-conversation-id": currentConversationId!,
      },
    });
  } catch (error) {
    console.error("Chat Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
