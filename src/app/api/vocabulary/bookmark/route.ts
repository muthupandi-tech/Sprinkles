import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";

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

    const { userVocabId, isBookmarked } = (await req.json()) as {
      userVocabId: string;
      isBookmarked: boolean;
    };

    if (!userVocabId || typeof isBookmarked !== "boolean") {
      return new Response("Invalid request data", { status: 400 });
    }

    const updated = await prisma.userVocabulary.update({
      where: { id: userVocabId, userId: user.id },
      data: { isBookmarked },
    });

    return Response.json({ success: true, isBookmarked: updated.isBookmarked });
  } catch (error) {
    console.error("Bookmark Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
