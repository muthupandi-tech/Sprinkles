
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { prisma } from "@/infrastructure/database/prisma";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export class AnalyticsService {
  /**
   * Generates or updates AI insights based on the user's recent activities.
   */
  static async generateAIInsights(userId: string) {
    // 1. Fetch recent user data
    const progress = await prisma.progress.findUnique({ where: { userId } });
    const recentSessions = await prisma.practiceSession.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    });
    const recentInterviews = await prisma.interviewSession.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    if (!progress) return null;

    // 2. Format data for the prompt
    const promptContext = `
      User Progress: Overall Score ${progress.overallScore}, Speaking ${progress.speakingScore}, Vocabulary ${progress.vocabularyScore}, Pronunciation ${progress.pronunciationScore}, Interview ${progress.interviewScore}.
      Recent Practice Sessions: ${JSON.stringify(recentSessions.map(s => ({ type: s.type, score: s.score, feedback: s.feedback })))}
      Recent Interviews: ${JSON.stringify(recentInterviews.map(i => ({ type: i.interviewType, score: i.overallScore, feedback: i.feedbackJson })))}
    `;

    // 3. Generate Insights & Recommendations using AI SDK
    const { object } = await generateObject({
      model: openai("gpt-4o"),
      system: `You are an expert communication coach analyzing a student's progress. 
      Generate 3 personalized insights summarizing their recent performance trends.
      Generate 3 specific, actionable recommendations for them to improve.`,
      prompt: promptContext,
      schema: z.object({
        insights: z.array(z.string()).length(3),
        recommendations: z.array(
          z.object({
            content: z.string(),
            type: z.enum(["pronunciation", "interview", "vocabulary", "fluency", "general"]),
          })
        ).length(3),
      }),
    });

    // 4. Save new recommendations to database
    // Clear old recommendations first to keep the dashboard clean
    await prisma.recommendation.deleteMany({ where: { userId } });
    
    await prisma.recommendation.createMany({
      data: object.recommendations.map(r => ({
        userId,
        content: r.content,
        type: r.type,
      })),
    });

    return object;
  }

  /**
   * Fetches aggregated analytics data for the dashboard.
   */
  static async getDashboardAnalytics(userId: string) {
    const progress = await prisma.progress.findUnique({ where: { userId } });
    const analytics = await prisma.analytics.findMany({
      where: { userId },
      orderBy: { date: "asc" },
      take: 30, // Last 30 days
    });

    const recommendations = await prisma.recommendation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    const goals = await prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return {
      progress,
      analyticsHistory: analytics,
      recommendations,
      goals,
    };
  }
}
