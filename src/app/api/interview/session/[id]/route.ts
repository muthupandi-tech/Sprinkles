import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    const session = await prisma.interviewSession.findUnique({
      where: { id },
      include: {
        questions: {
          include: { answer: true },
          orderBy: { order: "asc" }
        }
      }
    });

    if (!session || session.userId !== user.id) {
      return new Response("Not Found", { status: 404 });
    }

    return Response.json({ success: true, session });
  } catch (err) {
    console.error("Fetch Session Error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
