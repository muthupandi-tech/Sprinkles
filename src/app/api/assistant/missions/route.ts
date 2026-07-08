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

    const missions = await prisma.dailyMission.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return Response.json({ success: true, missions });
  } catch (error) {
    console.error("Missions GET Error:", error);
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
      system: `You are an AI learning coach generating a personalized set of daily missions for an English communication student.
User Info:
- English Level: ${profile?.englishProficiency || "Beginner"}
- Career Goal: ${profile?.careerGoal || "General"}
- Weakest Area: Speak: ${progress?.speakingScore}, Vocab: ${progress?.vocabularyScore}, Pronunciation: ${progress?.pronunciationScore}

Provide 3 to 4 specific, actionable daily missions. Keep descriptions short.`,
      prompt: "Generate today's missions.",
      schema: z.object({
        missions: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              type: z.enum(["vocabulary", "speaking", "pronunciation", "interview", "general"]),
              points: z.number().describe("Points awarded for completing, e.g., 10, 20"),
            })
          )
          .length(4),
      }),
    });

    // Mark previous missions as complete/archived if needed, or just clear them.
    // Here we'll just delete old uncompleted missions to keep it clean.
    await prisma.dailyMission.deleteMany({
      where: { userId: user.id, completed: false },
    });

    const newMissions = await Promise.all(
      object.missions.map((m) =>
        prisma.dailyMission.create({
          data: {
            userId: user.id,
            title: m.title,
            description: m.description,
            type: m.type,
            points: m.points,
            completed: false,
          },
        })
      )
    );

    return Response.json({ success: true, missions: newMissions });
  } catch (error) {
    console.error("Missions POST Error:", error);
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

    const { missionId, completed } = await req.json();

    const updatedMission = await prisma.dailyMission.update({
      where: { id: missionId },
      data: { completed },
    });

    return Response.json({ success: true, mission: updatedMission });
  } catch (error) {
    console.error("Missions PATCH Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
