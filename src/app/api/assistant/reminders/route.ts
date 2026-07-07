import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const reminders = await prisma.reminder.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" }
    });

    return Response.json({ success: true, reminders });
  } catch (error) {
    console.error("Reminders GET Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { title, type, time, enabled, days } = await req.json();

    const newReminder = await prisma.reminder.create({
      data: {
        userId: user.id,
        title,
        type,
        time,
        enabled,
        days
      }
    });

    return Response.json({ success: true, reminder: newReminder });
  } catch (error) {
    console.error("Reminders POST Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { id, enabled, time, days } = await req.json();

    const updatedReminder = await prisma.reminder.update({
      where: { id, userId: user.id },
      data: { enabled, time, days }
    });

    return Response.json({ success: true, reminder: updatedReminder });
  } catch (error) {
    console.error("Reminders PATCH Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return new Response("Missing id", { status: 400 });

    await prisma.reminder.delete({
      where: { id, userId: user.id }
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Reminders DELETE Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
