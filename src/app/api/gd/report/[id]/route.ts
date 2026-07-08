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

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    const session = await prisma.groupDiscussionSession.findUnique({
      where: { id, userId: user.id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!session) {
      return new NextResponse("Session not found", { status: 404 });
    }

    if (session.status === "completed" && session.feedbackJson) {
      return NextResponse.json({ success: true, session });
    }

    const historyText = session.messages.map((m) => `[${m.speakerName}]: ${m.content}`).join("\n");

    const systemPrompt = `You are an expert Group Discussion Assessor.
Analyze the following transcript of a Group Discussion on the topic: "${session.topic}".
Focus specifically on the performance of the human user, who is labeled as "[You]".
Evaluate their communication, leadership, critical thinking, and participation.

Return a structured JSON evaluation.`;

    const result = await generateObject({
      model: openrouter("openai/gpt-4o-mini", { structuredOutputs: false }),
      system: systemPrompt,
      prompt: `Transcript:\n${historyText}\n\nProvide the evaluation for "You".`,
      schema: z.object({
        overallScore: z.number().min(0).max(100).describe("Overall GD Score out of 100"),
        confidenceScore: z.number().min(0).max(100),
        fluencyScore: z.number().min(0).max(100),
        grammarScore: z.number().min(0).max(100),
        vocabularyScore: z.number().min(0).max(100),
        leadershipScore: z
          .number()
          .min(0)
          .max(100)
          .describe("Score based on how they guided or influenced the group"),
        criticalThinkingScore: z.number().min(0).max(100),
        listeningSkillsScore: z
          .number()
          .min(0)
          .max(100)
          .describe("Based on whether they acknowledged points made by others"),
        strengths: z.array(z.string()).describe("2-3 strengths"),
        weaknesses: z.array(z.string()).describe("2-3 areas for improvement"),
        missedOpportunities: z
          .array(z.string())
          .describe(
            "Points where they could have jumped in but didn't, or points they failed to address"
          ),
        betterResponses: z
          .array(
            z.object({
              originalContext: z.string(),
              whatTheySaid: z.string(),
              betterAlternative: z.string(),
              reason: z.string(),
            })
          )
          .describe(
            "1-2 examples of how they could have responded better to specific situations in the GD"
          ),
      }),
    });

    const feedback = result.object;

    // Update Session
    const updatedSession = await prisma.groupDiscussionSession.update({
      where: { id },
      data: {
        status: "completed",
        overallScore: feedback.overallScore,
        feedbackJson: feedback as any,
      },
    });

    // Update Progress globally
    const progress = await prisma.progress.findUnique({ where: { userId: user.id } });
    if (progress) {
      const newGdScore =
        progress.gdScore === 0
          ? feedback.overallScore
          : (progress.gdScore + feedback.overallScore) / 2;
      const newOverall = (progress.overallScore + newGdScore) / 2;

      await prisma.progress.update({
        where: { userId: user.id },
        data: {
          gdScore: newGdScore,
          overallScore: newOverall,
          totalPracticeTime: progress.totalPracticeTime + 5, // assume 5 mins per GD roughly
        },
      });
    }

    return NextResponse.json({ success: true, session: updatedSession });
  } catch (error) {
    console.error("GD Report Error:", error);
    return new NextResponse(JSON.stringify({ error: "Failed to generate report" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
