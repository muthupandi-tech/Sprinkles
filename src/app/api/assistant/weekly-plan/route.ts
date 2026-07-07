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

    const plan = await prisma.weeklyPlan.findFirst({
      where: { userId: user.id, status: "active" },
      orderBy: { createdAt: "desc" }
    });

    return Response.json({ success: true, plan });
  } catch (error) {
    console.error("WeeklyPlan GET Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const profile = await prisma.studentProfile.findUnique({
      where: { userId: user.id }
    });

    const progress = await prisma.progress.findUnique({
      where: { userId: user.id }
    });

    const { object } = await generateObject({
      model: openrouter("openai/gpt-4o-mini"),
      system: `You are an AI learning coach generating a 7-day weekly study plan.
User Info:
- English Level: ${profile?.englishProficiency || "Beginner"}
- Career Goal: ${profile?.careerGoal || "General"}
- Weakest Area: Speak: ${progress?.speakingScore}, Vocab: ${progress?.vocabularyScore}, Pronunciation: ${progress?.pronunciationScore}

Create a realistic weekly plan including Vocabulary, Speech Practice, Mock Interview, Group Discussion, and Pronunciation.`,
      prompt: "Generate a weekly plan.",
      schema: z.object({
        days: z.array(z.object({
          dayName: z.string().describe("e.g., Monday, Tuesday, etc."),
          tasks: z.array(z.object({
            title: z.string(),
            type: z.enum(["vocabulary", "speech", "interview", "gd", "pronunciation", "general"]),
            completed: z.boolean()
          })).max(3)
        })).length(7)
      })
    });

    // Archive previous plans
    await prisma.weeklyPlan.updateMany({
      where: { userId: user.id, status: "active" },
      data: { status: "archived" }
    });

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 7);

    const newPlan = await prisma.weeklyPlan.create({
      data: {
        userId: user.id,
        startDate,
        endDate,
        status: "active",
        tasksJson: object.days
      }
    });

    return Response.json({ success: true, plan: newPlan });
  } catch (error) {
    console.error("WeeklyPlan POST Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { planId, tasksJson } = await req.json();

    const updatedPlan = await prisma.weeklyPlan.update({
      where: { id: planId, userId: user.id },
      data: { tasksJson }
    });

    return Response.json({ success: true, plan: updatedPlan });
  } catch (error) {
    console.error("WeeklyPlan PATCH Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
