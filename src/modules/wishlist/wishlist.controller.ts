import { Request, Response } from 'express';
import { wishlistService, WishlistService } from './wishlist.service.js';
import { sendCreated, sendSuccess } from '../../common/utils/response.js';
import { UnauthorizedError } from '../../common/errors/app-error.js';

export class WishlistController {
  constructor(private readonly service: WishlistService = wishlistService) {}

  public async getWishlist(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const wishlist = await this.service.getWishlist(req.user.id);
    sendSuccess(res, wishlist);
  }

  public async addItem(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const wishlist = await this.service.addItem(req.user.id, req.params.productId);
    sendCreated(res, wishlist);
  }

  public async removeItem(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const wishlist = await this.service.removeItem(req.user.id, req.params.productId);
    sendSuccess(res, wishlist);
  }
}

export const wishlistController = new WishlistController();
