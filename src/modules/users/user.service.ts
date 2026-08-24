import { userRepository, UserRepository } from './user.repository.js';
import { UpdateProfileInput } from './user.schema.js';
import { UserProfile } from './user.types.js';
import { NotFoundError } from '../../common/errors/app-error.js';
import { ErrorCodes } from '../../common/errors/error-codes.js';

export class UserService {
  constructor(private readonly repo: UserRepository = userRepository) {}

  public async getProfile(userId: string): Promise<UserProfile> {
    const user = await this.repo.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found', ErrorCodes.NOT_FOUND);
    }
    const { passwordHash: _, ...profile } = user;
    return profile;
  }

  public async updateProfile(userId: string, input: UpdateProfileInput): Promise<UserProfile> {
    const user = await this.repo.update(userId, input);
    const { passwordHash: _, ...profile } = user;
    return profile;
  }

  public async deactivateAccount(userId: string): Promise<void> {
    await this.repo.delete(userId);
  }
}

export const userService = new UserService();
