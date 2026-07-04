import { LearningPlan } from "../entities/plan";

export interface PlanRepository {
  findActiveByUserId(userId: string): Promise<LearningPlan | null>;
  create(plan: Omit<LearningPlan, "id" | "createdAt" | "updatedAt">): Promise<LearningPlan>;
  update(
    id: string,
    data: Partial<Omit<LearningPlan, "id" | "createdAt" | "updatedAt">>
  ): Promise<LearningPlan>;
}
