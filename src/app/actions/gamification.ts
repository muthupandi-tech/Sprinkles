"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";

export async function getGamificationData() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Get current user's progress and achievements
    const progress = await prisma.progress.findUnique({
      where: { userId: user.id },
    });

    const achievements = await prisma.achievement.findMany({
      where: { userId: user.id },
      orderBy: { unlockedAt: "desc" },
    });

    const missions = await prisma.dailyMission.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // Get Leaderboard (Top 10 users by overall score)
    const leaderboardRaw = await prisma.progress.findMany({
      orderBy: { overallScore: "desc" },
      take: 10,
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    const leaderboard = leaderboardRaw.map((p: any, index: number) => ({
      rank: index + 1,
      userId: p.userId,
      name: p.user?.profile?.fullName || p.user?.name || "Anonymous Learner",
      score: Math.round(p.overallScore),
      streak: p.currentStreak,
      isCurrentUser: p.userId === user.id,
      avatarInitials: (p.user?.profile?.fullName || p.user?.name || "A").charAt(0).toUpperCase(),
    }));

    // Generate mock achievements if none exist for demo purposes
    const displayAchievements =
      achievements.length > 0
        ? achievements
        : [
            {
              id: "1",
              title: "First Steps",
              description: "Completed your first practice session.",
              iconName: "Award",
              unlockedAt: new Date(),
            },
            {
              id: "2",
              title: "Vocabulary Novice",
              description: "Learned 10 new words.",
              iconName: "BookOpen",
              unlockedAt: new Date(),
            },
          ];

    return {
      success: true,
      progress,
      achievements: displayAchievements,
      missions,
      leaderboard,
    };
  } catch (error) {
    console.error("Error fetching gamification data:", error);
    return { success: false, error: "Failed to load gamification data." };
  }
}
