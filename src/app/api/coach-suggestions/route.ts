import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const suggestions = await prisma.coachSuggestion.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 4, // Get the latest 4 suggestions
    });

    return Response.json({ success: true, suggestions });
  } catch (error) {
    console.error("Coach Suggestions GET Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
