import { Coupon, CouponUsage, DiscountType } from '@prisma/client';

export type { Coupon, CouponUsage, DiscountType };

export interface CouponValidationResult {
  isValid: boolean;
  coupon: Coupon;
  discountAmount: number;
}
