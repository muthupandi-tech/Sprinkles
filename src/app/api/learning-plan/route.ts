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
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Find the active learning plan
    const plan = await prisma.learningPlan.findFirst({
      where: { userId: user.id, status: "active" },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ success: true, plan });
  } catch (error) {
    console.error("Learning Plan GET Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

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

    const progress = await prisma.progress.findUnique({
      where: { userId: user.id },
    });

    const { object } = await generateObject({
      model: openrouter("openai/gpt-4o-mini"),
      system: `You are an AI learning coach generating a daily personalized learning plan.
User Info:
- English Level: ${profile?.englishProficiency || "Beginner"}
- Career Goal: ${profile?.careerGoal || "General"}
- Weakest Area (based on scores): Speak: ${progress?.speakingScore}, Vocab: ${progress?.vocabularyScore}, Pronunciation: ${progress?.pronunciationScore}

Provide exactly 4 small actionable tasks for today's practice. Keep descriptions short.`,
      prompt: "Generate today's learning plan.",
      schema: z.object({
        tasks: z
          .array(
            z.object({
              id: z.string().describe("A unique slug/id for the task"),
              title: z.string(),
              completed: z.boolean(),
            })
          )
          .length(4),
      }),
    });

    // Mark previous plans as archived
    await prisma.learningPlan.updateMany({
      where: { userId: user.id, status: "active" },
      data: { status: "archived" },
    });

    const newPlan = await prisma.learningPlan.create({
      data: {
        userId: user.id,
        title: "Daily Practice Plan",
        status: "active",
        tasksJson: object.tasks,
        targetCompletionDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    return Response.json({ success: true, plan: newPlan });
  } catch (error) {
    console.error("Learning Plan POST Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { planId, taskId, completed } = await req.json();

    const plan = await prisma.learningPlan.findUnique({
      where: { id: planId, userId: user.id },
    });

    if (!plan) return new Response("Not found", { status: 404 });

    const tasks = plan.tasksJson as any[];
    const updatedTasks = tasks.map((t: any) => (t.id === taskId ? { ...t, completed } : t));

    const updatedPlan = await prisma.learningPlan.update({
      where: { id: planId },
      data: { tasksJson: updatedTasks },
    });

    return Response.json({ success: true, plan: updatedPlan });
  } catch (error) {
    console.error("Learning Plan PATCH Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
