/* eslint-disable @typescript-eslint/no-explicit-any */
import { SpeechRepository } from "@/core/repositories/speech-repository";
import { SpeechAttempt } from "@/core/entities/speech";
import { prisma } from "./prisma";

export class PrismaSpeechRepository implements SpeechRepository {
  async create(attempt: Omit<SpeechAttempt, "id" | "createdAt">): Promise<SpeechAttempt> {
    const created = await prisma.speechAttempt.create({
      data: {
        userId: attempt.userId,
        transcription: attempt.transcription,
        targetText: attempt.targetText,
        durationSeconds: attempt.durationSeconds,
        pronunciationScore: attempt.pronunciationScore,
        fluencyScore: attempt.fluencyScore,
        feedbackJson: attempt.feedbackJson as any,
        audioUrl: attempt.audioUrl,
      },
    });

    return {
      ...created,
      feedbackJson: created.feedbackJson as Record<string, any>,
    };
  }

  async listByUserId(userId: string, limit?: number): Promise<SpeechAttempt[]> {
    const attempts = await prisma.speechAttempt.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return attempts.map((attempt) => ({
      ...attempt,
      feedbackJson: attempt.feedbackJson as Record<string, any>,
    }));
  }
}
