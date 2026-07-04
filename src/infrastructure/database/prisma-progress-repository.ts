import { ProgressRepository } from "@/core/repositories/progress-repository";
import { StudentProgress } from "@/core/entities/progress";
import { prisma } from "./prisma";

export class PrismaProgressRepository implements ProgressRepository {
  async findByUserId(userId: string): Promise<StudentProgress | null> {
    return prisma.studentProgress.findUnique({ where: { userId } });
  }

  async upsert(
    userId: string,
    data: Partial<Omit<StudentProgress, "id" | "userId" | "updatedAt">>
  ): Promise<StudentProgress> {
    return prisma.studentProgress.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        spokenEnglishLevel: data.spokenEnglishLevel ?? "Beginner",
        vocabularyScore: data.vocabularyScore ?? 0,
        pronunciationScore: data.pronunciationScore ?? 0,
        confidenceScore: data.confidenceScore ?? 0,
        careerGoal: data.careerGoal ?? null,
      },
    });
  }
}
