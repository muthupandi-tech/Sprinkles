import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const sessions = await prisma.interviewSession.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ success: true, data: sessions });
  } catch (err) {
    console.error("Interview History Error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
