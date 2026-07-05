import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { NextResponse } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { sessionId, transcript } = await req.json();

    if (!sessionId) {
      return new NextResponse("Session ID is required", { status: 400 });
    }

    // Fetch session details
    const session = await prisma.groupDiscussionSession.findUnique({
      where: { id: sessionId, userId: user.id },
      include: {
        participants: true,
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!session) {
      return new NextResponse("Session not found", { status: 404 });
    }

    // Save user's message if provided
    let newMessagesToReturn = [];
    if (transcript && transcript.trim().length > 0) {
      const userMessage = await prisma.gDMessage.create({
        data: {
          sessionId,
          speakerName: "You",
          speakerRole: "user",
          content: transcript
        }
      });
      newMessagesToReturn.push(userMessage);
      // Temporarily append to session.messages for the LLM context
      session.messages.push(userMessage);
    }

    // Prepare participants context
    const participantContext = session.participants.map(p => `- ${p.name}: ${p.role}`).join("\n");
    
    // Prepare conversation history
    const historyText = session.messages.map(m => `[${m.speakerName}]: ${m.content}`).join("\n");

    const systemPrompt = `You are the Simulation Engine for an AI Group Discussion.
Topic: "${session.topic}"

The participants are:
${participantContext}

Your goal is to simulate a realistic, dynamic group discussion. Generate the next 1 to 2 messages in the discussion.
- Characters should stay true to their roles (e.g. Challenger might disagree, Supporter might agree, Critical Thinker might point out flaws).
- Keep each message concise (1-3 sentences) like a real verbal discussion.
- If the human user ("You") just spoke, have one or two AI participants react to their point.
- If the human user has been silent, have the AI participants debate each other or ask the user a question to draw them in.
- Do NOT output messages for "You" or "Moderator". Only output messages for the AI participants.
- Pick 1 or 2 participants to speak sequentially.

Output a JSON array of message objects.`;

    // Call LLM
    const result = await generateObject({
      model: openrouter("openai/gpt-4o-mini", { structuredOutputs: false }),
      system: systemPrompt,
      prompt: `Current Transcript:\n${historyText}\n\nGenerate the next 1-2 messages.`,
      schema: z.object({
        messages: z.array(z.object({
          participantName: z.string().describe("Must exactly match one of the participant names: " + session.participants.map(p => p.name).join(", ")),
          content: z.string().describe("What the participant says")
        }))
      })
    });

    const generatedMessages = result.object.messages;

    // Save generated messages to DB
    for (const gm of generatedMessages) {
      const participant = session.participants.find(p => p.name === gm.participantName);
      if (participant) {
        const aiMessage = await prisma.gDMessage.create({
          data: {
            sessionId,
            participantId: participant.id,
            speakerName: participant.name,
            speakerRole: "ai",
            content: gm.content
          }
        });
        newMessagesToReturn.push(aiMessage);
      }
    }

    return NextResponse.json({
      success: true,
      messages: newMessagesToReturn
    });

  } catch (error) {
    console.error("GD Message Error:", error);
    return new NextResponse(JSON.stringify({ error: "Failed to generate AI response" }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
