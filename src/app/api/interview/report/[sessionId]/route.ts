import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { sessionId } = await params;

    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: {
        questions: {
          include: { answer: true },
          orderBy: { order: "asc" }
        }
      }
    });

    if (!session || session.userId !== user.id) {
      return new Response("Session not found", { status: 404 });
    }

    if (session.feedbackJson && session.overallScore !== null) {
      // Report already generated
      return Response.json({ success: true, session });
    }

    // Prepare transcript for AI
    const transcript = session.questions.map(q => {
      let txt = `Q${q.order}: ${q.questionText}\n`;
      if (q.answer) {
        txt += `A${q.order}: ${q.answer.studentAnswer}\n[Scores - Grammar: ${q.answer.grammarScore}, Fluency: ${q.answer.fluencyScore}, Technical: ${q.answer.technicalAccuracy}]\n`;
      }
      return txt;
    }).join("\n");

    const systemPrompt = `You are a Senior Career Coach at ${session.company}.
    You just concluded a ${session.interviewType} interview with a candidate.
    Here is the full transcript and granular scores of the interview:
    
    ${transcript}
    
    Provide a comprehensive overall evaluation. 
    1. Overall Score (0-100) based on all their answers.
    2. Top 3 Strengths.
    3. Top 3 Areas for Improvement.
    4. Actionable Interview Tips for their next attempt.`;

    const result = await generateObject({
      model: openrouter("openai/gpt-4o-mini", { structuredOutputs: false }),
      system: systemPrompt,
      prompt: "Generate the final interview report.",
      schema: z.object({
        overallScore: z.number().min(0).max(100),
        strengths: z.array(z.string()).max(5),
        weaknesses: z.array(z.string()).max(5),
        tips: z.array(z.string()).max(5),
      }),
    });

    const updatedSession = await prisma.interviewSession.update({
      where: { id: sessionId },
      data: {
        overallScore: result.object.overallScore,
        status: "completed",
        feedbackJson: {
          strengths: result.object.strengths,
          weaknesses: result.object.weaknesses,
          tips: result.object.tips,
        }
      },
      include: {
        questions: {
          include: { answer: true },
          orderBy: { order: "asc" }
        }
      }
    });

    // Update global progress
    const progress = await prisma.progress.findUnique({ where: { userId: user.id } });
    if (progress) {
      const newScore = progress.interviewScore === 0 
        ? result.object.overallScore 
        : (progress.interviewScore + result.object.overallScore) / 2;
        
      await prisma.progress.update({
        where: { userId: user.id },
        data: { interviewScore: newScore }
      });
    }

    return Response.json({ success: true, session: updatedSession });
  } catch (err) {
    console.error("Interview Report Error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
