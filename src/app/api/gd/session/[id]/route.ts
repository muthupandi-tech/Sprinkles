import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    const session = await prisma.groupDiscussionSession.findUnique({
      where: { id, userId: user.id },
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

    return NextResponse.json({ success: true, session });
  } catch (error) {
    console.error("GD Session GET Error:", error);
    return new NextResponse(JSON.stringify({ error: "Failed to fetch session" }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
