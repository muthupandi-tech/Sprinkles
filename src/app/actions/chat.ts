"use server";

import { prisma } from "@/infrastructure/database/prisma";
import { createClient } from "@/lib/supabase/server";

export async function getConversations() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return { success: false, error: "Unauthorized" };
  }

  const conversations = await prisma.conversation.findMany({
    where: { userId: data.user.id },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, createdAt: true, updatedAt: true },
  });

  return { success: true, conversations };
}

export async function getMessages(conversationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return { success: false, error: "Unauthorized" };
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation || conversation.userId !== data.user.id) {
    return { success: false, error: "Conversation not found" };
  }

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
  });

  return { success: true, messages };
}

export async function renameConversation(conversationId: string, title: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return { success: false, error: "Unauthorized" };
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation || conversation.userId !== data.user.id) {
    return { success: false, error: "Conversation not found" };
  }

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { title },
  });

  return { success: true };
}

export async function deleteConversation(conversationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return { success: false, error: "Unauthorized" };
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation || conversation.userId !== data.user.id) {
    return { success: false, error: "Conversation not found" };
  }

  await prisma.conversation.delete({
    where: { id: conversationId },
  });

  return { success: true };
}
