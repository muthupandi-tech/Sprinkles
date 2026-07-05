import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const vocabularies = await prisma.userVocabulary.findMany({
      where: { userId: user.id },
      include: { word: true },
      orderBy: { createdAt: "desc" }
    });

    return Response.json({ success: true, data: vocabularies });
  } catch (error) {
    console.error("Vocab Bank Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
