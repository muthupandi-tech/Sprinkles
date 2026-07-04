import { StudentProgress } from "../entities/progress";

export interface ProgressRepository {
  findByUserId(userId: string): Promise<StudentProgress | null>;
  upsert(
    userId: string,
    data: Partial<Omit<StudentProgress, "id" | "userId" | "updatedAt">>
  ): Promise<StudentProgress>;
}
