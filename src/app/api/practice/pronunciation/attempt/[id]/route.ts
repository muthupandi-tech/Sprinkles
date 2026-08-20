import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    const attempt = await prisma.speechAttempt.findUnique({
      where: {
        id,
        userId: user.id, // ensure user can only fetch their own attempt
      },
    });

    if (!attempt) {
      return new NextResponse("Not Found", { status: 404 });
    }

    return NextResponse.json(attempt);
  } catch (error) {
    console.error("Error fetching attempt:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
