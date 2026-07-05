"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/infrastructure/database/prisma";
import { revalidatePath } from "next/cache";

export interface ProfileData {
  fullName: string;
  college: string;
  department: string;
  yearOfStudy: string;
  careerGoal: string;
  targetCompany: string;
  englishProficiency: string;
  preferredAccent: string;
  dailyPracticeGoal: number;
}

// Just-in-Time provisioning helper to ensure user database coherence
async function getOrCreateDbUser(userId: string, email: string, name?: string) {
  // Query user and check relations
  let dbUser = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      progress: true,
      missions: true,
      achievements: true,
      notifications: true,
    },
  });

  if (!dbUser) {
    const defaultName = name || email.split("@")[0];
    dbUser = await prisma.user.create({
      data: {
        id: userId,
        email,
        name: defaultName,
        profile: {
          create: {
            fullName: defaultName,
            college: "National Engineering College",
            department: "Computer Science and Engineering",
            yearOfStudy: "3rd Year",
            careerGoal: "Full-Stack Software Engineer",
            targetCompany: "Google",
            englishProficiency: "Intermediate",
            preferredAccent: "Indian",
            dailyPracticeGoal: 20,
          },
        },
        progress: {
          create: {
            currentStreak: 5,
            overallScore: 78.5,
            speakingScore: 74.0,
            vocabularyScore: 82.0,
            pronunciationScore: 76.5,
            interviewScore: 80.0,
            totalPracticeTime: 145,
            weeklyTimeHistory: [15, 20, 10, 30, 0, 15, 25],
          },
        },
      },
      include: {
        profile: true,
        progress: true,
        missions: true,
        achievements: true,
        notifications: true,
      },
    });
  }

  // Double check missing relations (e.g. if user table was created but sub-tables are missing)
  if (!dbUser.profile) {
    dbUser.profile = await prisma.studentProfile.create({
      data: {
        userId,
        fullName: dbUser.name || email.split("@")[0],
        college: "National Engineering College",
        department: "Computer Science and Engineering",
        yearOfStudy: "3rd Year",
        careerGoal: "Full-Stack Software Engineer",
        targetCompany: "Google",
        englishProficiency: "Intermediate",
        preferredAccent: "Indian",
        dailyPracticeGoal: 20,
      },
    });
  }

  if (!dbUser.progress) {
    dbUser.progress = await prisma.progress.create({
      data: {
        userId,
        currentStreak: 5,
        overallScore: 78.5,
        speakingScore: 74.0,
        vocabularyScore: 82.0,
        pronunciationScore: 76.5,
        interviewScore: 80.0,
        totalPracticeTime: 145,
        weeklyTimeHistory: [15, 20, 10, 30, 0, 15, 25],
      },
    });
  }

  // Provision missions if empty
  if (dbUser.missions.length === 0) {
    await prisma.dailyMission.createMany({
      data: [
        {
          userId,
          title: "Speak on a random topic for 2 minutes",
          description: "Practice your fluency and reduce filler words.",
          type: "speaking",
          points: 15,
          completed: true,
        },
        {
          userId,
          title: "Review 5 vocabulary cards",
          description: "Practice Spaced Repetition (SRS) words.",
          type: "vocabulary",
          points: 10,
          completed: false,
        },
        {
          userId,
          title: "Practice Indian accent pronunciation",
          description: "Master clean consonant enunciations.",
          type: "pronunciation",
          points: 10,
          completed: false,
        },
        {
          userId,
          title: "Complete a mock interview session",
          description: "Answer general behavior questions.",
          type: "interview",
          points: 25,
          completed: false,
        },
      ],
    });
    dbUser.missions = await prisma.dailyMission.findMany({ where: { userId } });
  }

  // Provision achievements if empty
  if (dbUser.achievements.length === 0) {
    await prisma.achievement.createMany({
      data: [
        {
          userId,
          title: "First Step",
          description: "Started your first practice session on Sprinkles.",
          iconName: "Compass",
        },
        {
          userId,
          title: "Streak Master",
          description: "Maintained a 5-day communication learning streak.",
          iconName: "Flame",
        },
        {
          userId,
          title: "Eloquent Speaker",
          description: "Scored above 80 points in an active speaking practice drill.",
          iconName: "Award",
        },
      ],
    });
    dbUser.achievements = await prisma.achievement.findMany({ where: { userId } });
  }

  // Provision notifications if empty
  if (dbUser.notifications.length === 0) {
    await prisma.notification.createMany({
      data: [
        {
          userId,
          title: "Welcome to Sprinkles!",
          message:
            "We're excited to have you here! Customize your study preferences on the profile page to get started.",
          read: false,
        },
        {
          userId,
          title: "New Daily Missions!",
          message:
            "You have 4 new daily missions waiting for you on your dashboard. Complete them to earn score boosts.",
          read: false,
        },
      ],
    });
    dbUser.notifications = await prisma.notification.findMany({ where: { userId } });
  }

  return dbUser;
}

export async function getDashboardData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return { success: false, error: "Unauthenticated" };
  }

  try {
    const dbUser = await getOrCreateDbUser(
      user.id,
      user.email,
      user.user_metadata?.full_name || user.email.split("@")[0]
    );

    const recentSessions = await prisma.practiceSession.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // If no practice sessions yet, create some default ones
    if (recentSessions.length === 0) {
      await prisma.practiceSession.createMany({
        data: [
          {
            userId: user.id,
            type: "Speaking",
            durationMinutes: 10,
            score: 75,
            feedback: "Good pacing, but try to use more varied vocabulary expressions.",
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          },
          {
            userId: user.id,
            type: "Pronunciation",
            durationMinutes: 5,
            score: 82,
            feedback: "Excellent vowel clarity. Focus on clean consonant word endings.",
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          },
          {
            userId: user.id,
            type: "Vocabulary",
            durationMinutes: 15,
            score: 90,
            feedback: "Learned 5 advanced vocabulary terms and completed the quiz successfully.",
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          },
        ],
      });

      const updatedSessions = await prisma.practiceSession.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 5,
      });

      return {
        success: true,
        profile: dbUser.profile,
        progress: dbUser.progress,
        missions: dbUser.missions,
        recentSessions: updatedSessions,
        achievements: dbUser.achievements,
        notifications: dbUser.notifications,
      };
    }

    return {
      success: true,
      profile: dbUser.profile,
      progress: dbUser.progress,
      missions: dbUser.missions,
      recentSessions,
      achievements: dbUser.achievements,
      notifications: dbUser.notifications,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch dashboard data";
    return { success: false, error: message };
  }
}

export async function getStudentProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return { success: false, error: "Unauthenticated" };
  }

  try {
    const dbUser = await getOrCreateDbUser(
      user.id,
      user.email,
      user.user_metadata?.full_name || user.email.split("@")[0]
    );

    return { success: true, profile: dbUser.profile };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch profile";
    return { success: false, error: message };
  }
}

export async function saveStudentProfile(data: ProfileData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthenticated" };
  }

  try {
    const updatedProfile = await prisma.studentProfile.update({
      where: { userId: user.id },
      data: {
        fullName: data.fullName,
        college: data.college,
        department: data.department,
        yearOfStudy: data.yearOfStudy,
        careerGoal: data.careerGoal,
        targetCompany: data.targetCompany,
        englishProficiency: data.englishProficiency,
        preferredAccent: data.preferredAccent,
        dailyPracticeGoal: Number(data.dailyPracticeGoal),
      },
    });

    // Also update the User model's name field
    await prisma.user.update({
      where: { id: user.id },
      data: { name: data.fullName },
    });

    revalidatePath("/profile");
    revalidatePath("/dashboard");
    return { success: true, profile: updatedProfile };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update profile";
    return { success: false, error: message };
  }
}

export async function toggleMission(missionId: string, completed: boolean) {
  try {
    const updatedMission = await prisma.dailyMission.update({
      where: { id: missionId },
      data: { completed },
    });
    revalidatePath("/dashboard");
    return { success: true, mission: updatedMission };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update mission";
    return { success: false, error: message };
  }
}

export async function getAnalyticsData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return { success: false, error: "Unauthenticated" };
  }

  try {
    const dbUser = await getOrCreateDbUser(
      user.id,
      user.email,
      user.user_metadata?.full_name || user.email.split("@")[0]
    );

    // Fetch practice session logs to populate charts
    const sessions = await prisma.practiceSession.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    });

    const mockVocabularyGrowth = [
      { month: "Jan", words: 40 },
      { month: "Feb", words: 85 },
      { month: "Mar", words: 130 },
      { month: "Apr", words: 195 },
      { month: "May", words: 240 },
      { month: "Jun", words: 310 },
    ];

    const mockSpeakingTimeline = [
      { date: "Mon", score: 68, fillerWords: 12 },
      { date: "Tue", score: 70, fillerWords: 10 },
      { date: "Wed", score: 74, fillerWords: 8 },
      { date: "Thu", score: 72, fillerWords: 9 },
      { date: "Fri", score: 78, fillerWords: 6 },
      { date: "Sat", score: 76, fillerWords: 7 },
      { date: "Sun", score: 81, fillerWords: 5 },
    ];

    const mockWeeklyPracticeTime = [
      { day: "Mon", minutes: 15 },
      { day: "Tue", minutes: 20 },
      { day: "Wed", minutes: 10 },
      { day: "Thu", minutes: 30 },
      { day: "Fri", minutes: 0 },
      { day: "Sat", minutes: 15 },
      { day: "Sun", minutes: 25 },
    ];

    const mockInterviewHistory = [
      { round: "Basic Behavioral", score: 65 },
      { round: "Vocal Presentation", score: 72 },
      { round: "Technical Explanation", score: 80 },
    ];

    return {
      success: true,
      progress: dbUser.progress,
      sessions,
      speakingTimeline: mockSpeakingTimeline,
      vocabularyGrowth: mockVocabularyGrowth,
      weeklyPracticeTime: mockWeeklyPracticeTime,
      interviewHistory: mockInterviewHistory,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch analytics";
    return { success: false, error: message };
  }
}

export async function getVocabularyProgress() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthenticated" };
  }

  try {
    const list = await prisma.vocabularyProgress.findMany({
      where: { userId: user.id },
      orderBy: { word: "asc" },
    });

    return { success: true, vocabulary: list };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch vocabulary";
    return { success: false, error: message };
  }
}

export async function addVocabularyWord(word: string, definition: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthenticated" };
  }

  try {
    const item = await prisma.vocabularyProgress.create({
      data: {
        userId: user.id,
        word,
        definition,
        learned: true,
        masteryLevel: 1,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, item };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to add word";
    return { success: false, error: message };
  }
}

export async function toggleNotificationRead(id: string) {
  try {
    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });
    revalidatePath("/dashboard");
    return { success: true, notification: updated };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update notification";
    return { success: false, error: message };
  }
}
