import { couponRepository, CouponRepository } from './coupon.repository.js';
import { CreateCouponInput, UpdateCouponInput } from './coupon.schema.js';
import { Coupon, Prisma } from '@prisma/client';
import { NotFoundError, ConflictError, BadRequestError } from '../../common/errors/app-error.js';
import { ErrorCodes } from '../../common/errors/error-codes.js';
import { CouponValidationResult } from './coupon.types.js';

export class CouponService {
  constructor(private readonly repo: CouponRepository = couponRepository) {}

  public async getCoupons(includeInactive: boolean = true): Promise<Coupon[]> {
    return this.repo.findAll(includeInactive);
  }

  public async getCouponById(id: string): Promise<Coupon> {
    const coupon = await this.repo.findById(id);
    if (!coupon) {
      throw new NotFoundError('Coupon not found', ErrorCodes.COUPON_NOT_FOUND);
    }
    return coupon;
  }

  public async getCouponByCode(code: string): Promise<Coupon> {
    const coupon = await this.repo.findByCode(code);
    if (!coupon) {
      throw new NotFoundError('Coupon not found', ErrorCodes.COUPON_NOT_FOUND);
    }
    return coupon;
  }

  public async createCoupon(input: CreateCouponInput): Promise<Coupon> {
    const existing = await this.repo.findByCode(input.code);
    if (existing) {
      throw new ConflictError('A coupon with this code already exists', ErrorCodes.CONFLICT);
    }

    if (input.validUntil <= input.validFrom) {
      throw new BadRequestError(
        'Valid until date must be after valid from date',
        ErrorCodes.BAD_REQUEST,
      );
    }

    return this.repo.create(input as Prisma.CouponCreateInput);
  }

  public async updateCoupon(id: string, input: UpdateCouponInput): Promise<Coupon> {
    await this.getCouponById(id);

    if (input.code) {
      const existing = await this.repo.findByCode(input.code);
      if (existing && existing.id !== id) {
        throw new ConflictError('A coupon with this code already exists', ErrorCodes.CONFLICT);
      }
    }

    return this.repo.update(id, input as Prisma.CouponUpdateInput);
  }

  public async deleteCoupon(id: string): Promise<void> {
    await this.getCouponById(id);
    await this.repo.delete(id);
  }

  public async validateCoupon(
    code: string,
    subtotal: number,
    userId?: string,
  ): Promise<CouponValidationResult> {
    const coupon = await this.repo.findByCode(code);
    if (!coupon || !coupon.isActive) {
      throw new NotFoundError('Invalid or inactive coupon code', ErrorCodes.COUPON_NOT_FOUND);
    }

    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validUntil) {
      throw new BadRequestError('Coupon is expired or not yet valid', ErrorCodes.COUPON_EXPIRED);
    }

    if (coupon.minOrderValue && subtotal < Number(coupon.minOrderValue)) {
      throw new BadRequestError(
        `Minimum order amount of ₹${coupon.minOrderValue} required for this coupon`,
        ErrorCodes.COUPON_MIN_ORDER_NOT_MET,
      );
    }

    const usagesCount = (coupon as any)._count?.usages || 0;
    if (coupon.usageLimit && usagesCount >= coupon.usageLimit) {
      throw new BadRequestError(
        'Coupon total usage limit reached',
        ErrorCodes.COUPON_USAGE_LIMIT_REACHED,
      );
    }

    if (userId && coupon.perUserLimit) {
      const userUsageCount = await this.repo.getUserUsageCount(coupon.id, userId);
      if (userUsageCount >= coupon.perUserLimit) {
        throw new BadRequestError(
          'You have reached the usage limit for this coupon',
          ErrorCodes.COUPON_USAGE_LIMIT_REACHED,
        );
      }
    }

    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (subtotal * Number(coupon.discountValue)) / 100;
      if (coupon.maxDiscount) {
        discountAmount = Math.min(discountAmount, Number(coupon.maxDiscount));
      }
    } else {
      discountAmount = Math.min(Number(coupon.discountValue), subtotal);
    }

    // Round to 2 decimal places
    discountAmount = Math.round(discountAmount * 100) / 100;

    return {
      isValid: true,
      coupon,
      discountAmount,
    };
  }

  public async recordCouponUsage(
    couponId: string,
    userId: string,
    orderId: string,
    tx?: Prisma.TransactionClient,
  ) {
    return this.repo.recordUsage(couponId, userId, orderId, tx);
  }
}

export const couponService = new CouponService();
