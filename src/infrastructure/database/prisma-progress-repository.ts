import { ProgressRepository } from "@/core/repositories/progress-repository";
import { StudentProgress } from "@/core/entities/progress";
import { prisma } from "./prisma";

export class PrismaProgressRepository implements ProgressRepository {
  async findByUserId(userId: string): Promise<StudentProgress | null> {
    const progress = await prisma.progress.findUnique({ where: { userId } });
    return progress ? (progress as StudentProgress) : null;
  }

  async upsert(
    userId: string,
    data: Partial<Omit<StudentProgress, "id" | "userId" | "updatedAt">>
  ): Promise<StudentProgress> {
    const progress = await prisma.progress.upsert({
      where: { userId },
      update: {
        ...data,
        weeklyTimeHistory: data.weeklyTimeHistory ?? undefined,
      },
      create: {
        userId,
        currentStreak: data.currentStreak ?? 0,
        overallScore: data.overallScore ?? 0,
        speakingScore: data.speakingScore ?? 0,
        vocabularyScore: data.vocabularyScore ?? 0,
        pronunciationScore: data.pronunciationScore ?? 0,
        interviewScore: data.interviewScore ?? 0,
        totalPracticeTime: data.totalPracticeTime ?? 0,
        weeklyTimeHistory: data.weeklyTimeHistory ?? [],
      },
    });
    return progress as StudentProgress;
  }
}
