import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../../src/modules/auth/auth.service.js';
import { ConflictError, UnauthorizedError } from '../../src/common/errors/app-error.js';
import argon2 from 'argon2';

describe('AuthService', () => {
  let authService: AuthService;
  let mockAuthRepo: any;

  beforeEach(() => {
    mockAuthRepo = {
      findByEmail: vi.fn(),
      createUser: vi.fn(),
      findRefreshToken: vi.fn(),
      createRefreshToken: vi.fn(),
      revokeRefreshToken: vi.fn(),
      revokeAllUserTokens: vi.fn(),
    };
    authService = new AuthService(mockAuthRepo);
  });

  describe('register', () => {
    it('should register a new user with hashed password and return tokens', async () => {
      mockAuthRepo.findByEmail.mockResolvedValue(null);
      mockAuthRepo.createUser.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'CUSTOMER',
      });
      mockAuthRepo.createRefreshToken.mockResolvedValue({});

      const result = await authService.register({
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(result.user.email).toBe('test@example.com');
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();
      expect(mockAuthRepo.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'CUSTOMER',
        }),
      );
    });

    it('should throw ConflictError if user email already exists', async () => {
      mockAuthRepo.findByEmail.mockResolvedValue({ id: 'existing-user' });

      await expect(
        authService.register({
          email: 'existing@example.com',
          password: 'Password123!',
          firstName: 'John',
          lastName: 'Doe',
        }),
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('login', () => {
    it('should successfully log in user with valid password', async () => {
      const passwordHash = await argon2.hash('SecretPass123!');
      mockAuthRepo.findByEmail.mockResolvedValue({
        id: 'user-123',
        email: 'john@example.com',
        passwordHash,
        firstName: 'John',
        lastName: 'Doe',
        role: 'CUSTOMER',
        isActive: true,
      });
      mockAuthRepo.createRefreshToken.mockResolvedValue({});

      const result = await authService.login({
        email: 'john@example.com',
        password: 'SecretPass123!',
      });

      expect(result.user.id).toBe('user-123');
      expect(result.tokens.accessToken).toBeDefined();
    });

    it('should throw UnauthorizedError with invalid password', async () => {
      const passwordHash = await argon2.hash('CorrectPassword123!');
      mockAuthRepo.findByEmail.mockResolvedValue({
        id: 'user-123',
        email: 'john@example.com',
        passwordHash,
        isActive: true,
      });

      await expect(
        authService.login({
          email: 'john@example.com',
          password: 'WrongPassword!',
        }),
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError if user is inactive', async () => {
      mockAuthRepo.findByEmail.mockResolvedValue({
        id: 'user-123',
        email: 'john@example.com',
        isActive: false,
      });

      await expect(
        authService.login({
          email: 'john@example.com',
          password: 'Password123!',
        }),
      ).rejects.toThrow(UnauthorizedError);
    });
  });
});
