/* eslint-disable @typescript-eslint/no-explicit-any */
import { PlanRepository } from "@/core/repositories/plan-repository";
import { LearningPlan } from "@/core/entities/plan";
import { prisma } from "./prisma";

export class PrismaPlanRepository implements PlanRepository {
  async findActiveByUserId(userId: string): Promise<LearningPlan | null> {
    const plan = await prisma.learningPlan.findFirst({
      where: { userId, status: "active" },
    });
    if (!plan) return null;
    return {
      ...plan,
      status: plan.status as "active" | "completed" | "archived",
      tasksJson: plan.tasksJson as any,
    };
  }

  async create(plan: Omit<LearningPlan, "id" | "createdAt" | "updatedAt">): Promise<LearningPlan> {
    const created = await prisma.learningPlan.create({
      data: {
        userId: plan.userId,
        title: plan.title,
        description: plan.description,
        tasksJson: plan.tasksJson as any,
        status: plan.status,
        targetCompletionDate: plan.targetCompletionDate,
      },
    });
    return {
      ...created,
      status: created.status as "active" | "completed" | "archived",
      tasksJson: created.tasksJson as any,
    };
  }

  async update(
    id: string,
    data: Partial<Omit<LearningPlan, "id" | "createdAt" | "updatedAt">>
  ): Promise<LearningPlan> {
    const updated = await prisma.learningPlan.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        tasksJson: data.tasksJson as any,
        status: data.status,
        targetCompletionDate: data.targetCompletionDate,
      },
    });
    return {
      ...updated,
      status: updated.status as "active" | "completed" | "archived",
      tasksJson: updated.tasksJson as any,
    };
  }
}
