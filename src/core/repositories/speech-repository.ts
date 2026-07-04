import { SpeechAttempt } from "../entities/speech";

export interface SpeechRepository {
  create(attempt: Omit<SpeechAttempt, "id" | "createdAt">): Promise<SpeechAttempt>;
  listByUserId(userId: string, limit?: number): Promise<SpeechAttempt[]>;
}
