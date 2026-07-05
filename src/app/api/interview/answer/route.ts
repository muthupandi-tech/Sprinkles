import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
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
      return new Response("Unauthorized", { status: 401 });
    }

    const { sessionId, questionId, studentAnswer, currentOrder } = await req.json() as {
      sessionId: string;
      questionId: string;
      studentAnswer: string;
      currentOrder: number;
    };

    if (!sessionId || !questionId || !studentAnswer) {
      return new Response("Missing fields", { status: 400 });
    }

    // 1. Fetch Session and previous questions for context
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

    const currentQuestion = session.questions.find(q => q.id === questionId);
    if (!currentQuestion) return new Response("Question not found", { status: 404 });

    // Build chat history for AI Context
    const conversationHistory = session.questions.map(q => {
      let turn = `AI Interviewer: ${q.questionText}`;
      if (q.answer) turn += `\nStudent: ${q.answer.studentAnswer}`;
      return turn;
    }).join("\n\n");

    const systemPrompt = `You are an expert ${session.interviewType} Interviewer for ${session.company}.
    The candidate just answered your question. 
    Here is the conversation so far:
    ${conversationHistory}
    
    Student's Latest Answer: "${studentAnswer}"

    Analyze this answer. Provide a grammar score (0-100), fluency score (0-100), technical accuracy / relevance score (0-100).
    Also provide brief feedback on this answer and a "better sample answer" they could have used.

    THEN, if this is question #${currentOrder} out of 5, generate the NEXT follow-up question.
    If this is question 5, set "isComplete" to true and leave the next question empty.`;

    const result = await generateObject({
      model: openrouter("openai/gpt-4o-mini", { structuredOutputs: false }),
      system: systemPrompt,
      prompt: "Evaluate the answer and provide the next step.",
      schema: z.object({
        evaluation: z.object({
          grammarScore: z.number().min(0).max(100),
          fluencyScore: z.number().min(0).max(100),
          technicalAccuracy: z.number().min(0).max(100),
          overallScore: z.number().min(0).max(100),
          feedback: z.string().describe("Constructive feedback for this specific answer"),
          betterSampleAnswer: z.string().describe("How a professional would have answered"),
        }),
        nextQuestion: z.string().optional().describe("The next question to ask, if not complete"),
        isComplete: z.boolean().describe("True if the interview has reached 5 questions and should conclude"),
      }),
    });

    // 2. Save the Answer
    const answer = await prisma.interviewAnswer.create({
      data: {
        questionId: questionId,
        studentAnswer,
        grammarScore: result.object.evaluation.grammarScore,
        fluencyScore: result.object.evaluation.fluencyScore,
        technicalAccuracy: result.object.evaluation.technicalAccuracy,
        overallScore: result.object.evaluation.overallScore,
        feedbackJson: {
          feedback: result.object.evaluation.feedback,
          betterSampleAnswer: result.object.evaluation.betterSampleAnswer,
        }
      }
    });

    // 3. Generate Next Question OR Complete Session
    if (result.object.isComplete || currentOrder >= 5) {
      await prisma.interviewSession.update({
        where: { id: sessionId },
        data: { status: "completed" }
      });
      return Response.json({ success: true, isComplete: true, evaluation: answer });
    } else {
      const nextQuestion = await prisma.interviewQuestion.create({
        data: {
          sessionId,
          questionText: result.object.nextQuestion || "Can you elaborate on that?",
          order: currentOrder + 1
        }
      });
      return Response.json({ success: true, isComplete: false, evaluation: answer, nextQuestion });
    }

  } catch (err) {
    console.error("Interview Answer Error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
