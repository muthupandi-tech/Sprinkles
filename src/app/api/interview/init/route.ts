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

    const { company, interviewType, resumeContext } = await req.json() as {
      company: string;
      interviewType: string;
      resumeContext?: string;
    };

    if (!company || !interviewType) {
      return new Response("Missing required fields", { status: 400 });
    }

    // 1. Create the session
    const session = await prisma.interviewSession.create({
      data: {
        userId: user.id,
        company,
        interviewType,
        resumeContext,
        status: "in_progress",
      }
    });

    // 2. Generate the first question using AI
    const profile = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
    
    const systemPrompt = `You are an expert ${interviewType} Interviewer for ${company}.
    You are interviewing a candidate whose career goal is: ${profile?.careerGoal || 'Unknown'}.
    ${resumeContext ? `Here is the candidate's resume/background context:\n${resumeContext}\n` : ''}
    Generate the FIRST question you would ask them to start the interview.
    Keep it conversational, professional, and relevant to the company and role.`;

    const result = await generateObject({
      model: openrouter("openai/gpt-4o-mini", { structuredOutputs: false }),
      system: systemPrompt,
      prompt: "Generate the first interview question.",
      schema: z.object({
        questionText: z.string().describe("The text of the interview question"),
      }),
    });

    // 3. Save the question
    const question = await prisma.interviewQuestion.create({
      data: {
        sessionId: session.id,
        questionText: result.object.questionText,
        order: 1,
      }
    });

    return Response.json({ success: true, sessionId: session.id, firstQuestion: question });
  } catch (err) {
    console.error("Interview Init Error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
