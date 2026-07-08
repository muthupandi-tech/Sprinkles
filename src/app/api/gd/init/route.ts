import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { topic, category } = await req.json();

    if (!topic || !category) {
      return new NextResponse("Topic and category are required", { status: 400 });
    }

    // Define unique personas
    const personas = [
      {
        name: "Alex",
        role: "Leader",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=b6e3f4",
      },
      {
        name: "Sam",
        role: "Critical Thinker",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sam&backgroundColor=c0aede",
      },
      {
        name: "Jordan",
        role: "Supporter",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan&backgroundColor=ffd5dc",
      },
      {
        name: "Taylor",
        role: "Challenger",
        avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Taylor&backgroundColor=ffdfbf",
      },
    ];

    // Create session and participants
    const session = await prisma.groupDiscussionSession.create({
      data: {
        userId: user.id,
        topic,
        category,
        status: "in_progress",
        participants: {
          create: personas,
        },
      },
      include: {
        participants: true,
      },
    });

    // Create Moderator welcome message
    const initialMessage = await prisma.gDMessage.create({
      data: {
        sessionId: session.id,
        speakerName: "Moderator",
        speakerRole: "moderator",
        content: `Welcome everyone to this group discussion. Our topic today is: "${topic}". We are looking forward to a healthy debate and insightful perspectives. The floor is now open for anyone to start.`,
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      participants: session.participants,
      messages: [initialMessage],
    });
  } catch (error) {
    console.error("GD Init Error:", error);
    return new NextResponse(JSON.stringify({ error: "Failed to initialize session" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
