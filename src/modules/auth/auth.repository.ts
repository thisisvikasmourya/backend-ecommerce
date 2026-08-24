import { prisma } from '../../config/database.js';
import { User, RefreshToken, Prisma } from '@prisma/client';

export class AuthRepository {
  public async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  public async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  public async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({
      data,
    });
  }

  public async createRefreshToken(data: Prisma.RefreshTokenCreateInput): Promise<RefreshToken> {
    return prisma.refreshToken.create({
      data,
    });
  }

  public async findRefreshToken(tokenHash: string): Promise<(RefreshToken & { user: User }) | null> {
    return prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
  }

  public async revokeRefreshToken(id: string): Promise<RefreshToken> {
    return prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }

  public async revokeAllUserTokens(userId: string): Promise<Prisma.BatchPayload> {
    return prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}

export const authRepository = new AuthRepository();
