import { Request, Response } from 'express';
import { couponService, CouponService } from './coupon.service.js';
import { sendCreated, sendSuccess } from '../../common/utils/response.js';

export class CouponController {
  constructor(private readonly service: CouponService = couponService) {}

  public async getCoupons(_req: Request, res: Response): Promise<void> {
    const coupons = await this.service.getCoupons();
    sendSuccess(res, coupons);
  }

  public async getCouponById(req: Request, res: Response): Promise<void> {
    const coupon = await this.service.getCouponById(req.params.id);
    sendSuccess(res, coupon);
  }

  public async createCoupon(req: Request, res: Response): Promise<void> {
    const coupon = await this.service.createCoupon(req.body);
    sendCreated(res, coupon);
  }

  public async updateCoupon(req: Request, res: Response): Promise<void> {
    const coupon = await this.service.updateCoupon(req.params.id, req.body);
    sendSuccess(res, coupon);
  }

  public async deleteCoupon(req: Request, res: Response): Promise<void> {
    await this.service.deleteCoupon(req.params.id);
    sendSuccess(res, { message: 'Coupon deleted successfully' });
  }

  public async validateCoupon(req: Request, res: Response): Promise<void> {
    const { code, subtotal } = req.body;
    const userId = req.user?.id;
    const result = await this.service.validateCoupon(code, subtotal, userId);
    sendSuccess(res, result);
  }
}

export const couponController = new CouponController();
