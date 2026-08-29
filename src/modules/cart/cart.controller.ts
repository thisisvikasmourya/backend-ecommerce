import { Request, Response } from 'express';
import { cartService, CartService } from './cart.service.js';
import { sendCreated, sendSuccess } from '../../common/utils/response.js';
import { UnauthorizedError } from '../../common/errors/app-error.js';

export class CartController {
  constructor(private readonly service: CartService = cartService) {}

  public async getCart(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const couponCode = req.query.coupon as string | undefined;
    const cart = await this.service.getCart(req.user.id, couponCode);
    sendSuccess(res, cart);
  }

  public async addItem(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const cart = await this.service.addItem(req.user.id, req.body);
    sendCreated(res, cart);
  }

  public async updateItemQuantity(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const cart = await this.service.updateItemQuantity(req.user.id, req.params.itemId, req.body);
    sendSuccess(res, cart);
  }

  public async removeItem(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const cart = await this.service.removeItem(req.user.id, req.params.itemId);
    sendSuccess(res, cart);
  }

  public async clearCart(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    await this.service.clearCart(req.user.id);
    sendSuccess(res, { message: 'Cart cleared successfully' });
  }

  public async applyCoupon(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const cart = await this.service.applyCoupon(req.user.id, req.body.code);
    sendSuccess(res, cart);
  }

  public async removeCoupon(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const cart = await this.service.getCart(req.user.id);
    sendSuccess(res, cart);
  }
}

export const cartController = new CartController();
