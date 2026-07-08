import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";

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

    // Get current month and year from query params, default to now
    const { searchParams } = new URL(req.url);
    const month = parseInt(searchParams.get("month") || (new Date().getMonth() + 1).toString());
    const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString());

    // Calculate start and end of the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const events = await prisma.calendarEvent.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: "asc" },
    });

    return Response.json({ success: true, events });
  } catch (error) {
    console.error("Calendar GET Error:", error);
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

    const { title, date, type } = await req.json();

    const newEvent = await prisma.calendarEvent.create({
      data: {
        userId: user.id,
        title,
        date: new Date(date),
        type,
        completed: false,
      },
    });

    return Response.json({ success: true, event: newEvent });
  } catch (error) {
    console.error("Calendar POST Error:", error);
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

    const { id, completed } = await req.json();

    const updatedEvent = await prisma.calendarEvent.update({
      where: { id, userId: user.id },
      data: { completed },
    });

    return Response.json({ success: true, event: updatedEvent });
  } catch (error) {
    console.error("Calendar PATCH Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
