import { UserRepository } from "@/core/repositories/user-repository";
import { User } from "@/core/entities/user";
import { prisma } from "./prisma";

export class PrismaUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async create(user: {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
  }): Promise<User> {
    return prisma.user.create({ data: user });
  }

  async update(
    id: string,
    data: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>
  ): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }
}
