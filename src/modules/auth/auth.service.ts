import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { authRepository, AuthRepository } from './auth.repository.js';
import { RegisterInput, LoginInput } from './auth.schema.js';
import { AuthResponse, AuthTokens } from './auth.types.js';
import { ConflictError, UnauthorizedError } from '../../common/errors/app-error.js';
import { ErrorCodes } from '../../common/errors/error-codes.js';
import { env } from '../../config/env.js';
import { Role } from '../../common/constants/roles.js';

export class AuthService {
  constructor(private readonly repo: AuthRepository = authRepository) {}

  public async register(input: RegisterInput): Promise<AuthResponse> {
    const existing = await this.repo.findByEmail(input.email);
    if (existing) {
      throw new ConflictError(
        'A user with this email address already exists',
        ErrorCodes.USER_ALREADY_EXISTS,
      );
    }

    const passwordHash = await argon2.hash(input.password);

    const user = await this.repo.createUser({
      email: input.email.toLowerCase(),
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      role: 'CUSTOMER',
    });

    const tokens = await this.generateTokenPair(user.id, user.email, user.role as Role);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role as Role,
      },
      tokens,
    };
  }

  public async login(input: LoginInput): Promise<AuthResponse> {
    const user = await this.repo.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password', ErrorCodes.INVALID_CREDENTIALS);
    }

    if (!user.isActive) {
      throw new UnauthorizedError(
        'Account is inactive. Please contact support.',
        ErrorCodes.USER_INACTIVE,
      );
    }

    const isValid = await argon2.verify(user.passwordHash, input.password);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password', ErrorCodes.INVALID_CREDENTIALS);
    }

    const tokens = await this.generateTokenPair(user.id, user.email, user.role as Role);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role as Role,
      },
      tokens,
    };
  }

  public async refreshTokens(rawRefreshToken: string): Promise<AuthTokens> {
    const tokenHash = this.hashToken(rawRefreshToken);
    const tokenRecord = await this.repo.findRefreshToken(tokenHash);

    if (!tokenRecord || tokenRecord.revokedAt || tokenRecord.expiresAt < new Date()) {
      if (tokenRecord?.revokedAt) {
        // Potential token reuse attack, revoke all tokens for this user
        await this.repo.revokeAllUserTokens(tokenRecord.userId);
      }
      throw new UnauthorizedError(
        'Invalid or expired refresh token',
        ErrorCodes.REFRESH_TOKEN_REVOKED,
      );
    }

    // Revoke old token (rotation)
    await this.repo.revokeRefreshToken(tokenRecord.id);

    // Generate new pair
    return this.generateTokenPair(
      tokenRecord.user.id,
      tokenRecord.user.email,
      tokenRecord.user.role as Role,
    );
  }

  public async logout(rawRefreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(rawRefreshToken);
    const tokenRecord = await this.repo.findRefreshToken(tokenHash);
    if (tokenRecord) {
      await this.repo.revokeRefreshToken(tokenRecord.id);
    }
  }

  private async generateTokenPair(userId: string, email: string, role: Role): Promise<AuthTokens> {
    const accessToken = jwt.sign({ userId, email, role }, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });

    const rawRefreshToken = crypto.randomBytes(40).toString('hex');
    const tokenHash = this.hashToken(rawRefreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.repo.createRefreshToken({
      tokenHash,
      user: { connect: { id: userId } },
      expiresAt,
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}

export const authService = new AuthService();
