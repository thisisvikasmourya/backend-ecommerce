import { prisma } from '../../config/database.js';
import { User, Prisma } from '@prisma/client';

export class UserRepository {
  public async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  public async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  public async delete(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

export const userRepository = new UserRepository();
