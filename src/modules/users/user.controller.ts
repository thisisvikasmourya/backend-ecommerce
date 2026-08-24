import { Request, Response } from 'express';
import { userService, UserService } from './user.service.js';
import { sendSuccess } from '../../common/utils/response.js';
import { UnauthorizedError } from '../../common/errors/app-error.js';

export class UserController {
  constructor(private readonly service: UserService = userService) {}

  public async getProfile(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const profile = await this.service.getProfile(req.user.id);
    sendSuccess(res, profile);
  }

  public async updateProfile(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const profile = await this.service.updateProfile(req.user.id, req.body);
    sendSuccess(res, profile);
  }

  public async deactivateAccount(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    await this.service.deactivateAccount(req.user.id);
    sendSuccess(res, { message: 'Account deactivated successfully' });
  }
}

export const userController = new UserController();
