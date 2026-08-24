import { Request, Response } from 'express';
import { authService, AuthService } from './auth.service.js';
import { sendCreated, sendSuccess } from '../../common/utils/response.js';

export class AuthController {
  constructor(private readonly service: AuthService = authService) {}

  public async register(req: Request, res: Response): Promise<void> {
    const result = await this.service.register(req.body);
    sendCreated(res, result);
  }

  public async login(req: Request, res: Response): Promise<void> {
    const result = await this.service.login(req.body);
    sendSuccess(res, result);
  }

  public async refresh(req: Request, res: Response): Promise<void> {
    const tokens = await this.service.refreshTokens(req.body.refreshToken);
    sendSuccess(res, tokens);
  }

  public async logout(req: Request, res: Response): Promise<void> {
    if (req.body.refreshToken) {
      await this.service.logout(req.body.refreshToken);
    }
    sendSuccess(res, { message: 'Logged out successfully' });
  }

  public async getMe(req: Request, res: Response): Promise<void> {
    sendSuccess(res, { user: req.user });
  }
}

export const authController = new AuthController();
