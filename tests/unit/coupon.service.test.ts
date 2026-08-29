import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CouponService } from '../../src/modules/coupons/coupon.service.js';
import { BadRequestError, NotFoundError } from '../../src/common/errors/app-error.js';

describe('CouponService', () => {
  let couponService: CouponService;
  let mockCouponRepo: any;

  beforeEach(() => {
    mockCouponRepo = {
      findByCode: vi.fn(),
      getUserUsageCount: vi.fn(),
      create: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findAll: vi.fn(),
    };
    couponService = new CouponService(mockCouponRepo);
  });

  describe('validateCoupon', () => {
    it('should correctly calculate a percentage discount with max cap', async () => {
      const validUntil = new Date();
      validUntil.setFullYear(validUntil.getFullYear() + 1);

      mockCouponRepo.findByCode.mockResolvedValue({
        id: 'coupon-1',
        code: 'SAVE20',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        minOrderValue: 1000,
        maxDiscount: 500,
        usageLimit: 100,
        perUserLimit: 2,
        validFrom: new Date(Date.now() - 100000),
        validUntil,
        isActive: true,
        _count: { usages: 5 },
      });
      mockCouponRepo.getUserUsageCount.mockResolvedValue(0);

      // 20% of 4000 = 800, but capped at 500
      const result = await couponService.validateCoupon('SAVE20', 4000, 'user-1');

      expect(result.isValid).toBe(true);
      expect(result.discountAmount).toBe(500);
      expect(result.coupon.code).toBe('SAVE20');
    });

    it('should correctly calculate a fixed amount discount', async () => {
      const validUntil = new Date();
      validUntil.setFullYear(validUntil.getFullYear() + 1);

      mockCouponRepo.findByCode.mockResolvedValue({
        id: 'coupon-2',
        code: 'FLAT300',
        discountType: 'FIXED',
        discountValue: 300,
        minOrderValue: 1500,
        maxDiscount: null,
        usageLimit: null,
        perUserLimit: 1,
        validFrom: new Date(Date.now() - 100000),
        validUntil,
        isActive: true,
        _count: { usages: 1 },
      });
      mockCouponRepo.getUserUsageCount.mockResolvedValue(0);

      const result = await couponService.validateCoupon('FLAT300', 2000, 'user-1');

      expect(result.isValid).toBe(true);
      expect(result.discountAmount).toBe(300);
    });

    it('should throw BadRequestError if order subtotal is below minOrderValue', async () => {
      const validUntil = new Date();
      validUntil.setFullYear(validUntil.getFullYear() + 1);

      mockCouponRepo.findByCode.mockResolvedValue({
        id: 'coupon-1',
        code: 'SAVE20',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        minOrderValue: 2000,
        validFrom: new Date(Date.now() - 100000),
        validUntil,
        isActive: true,
        _count: { usages: 0 },
      });

      await expect(couponService.validateCoupon('SAVE20', 1500, 'user-1')).rejects.toThrow(BadRequestError);
    });

    it('should throw BadRequestError if coupon has expired', async () => {
      const expiredDate = new Date(Date.now() - 100000);

      mockCouponRepo.findByCode.mockResolvedValue({
        id: 'coupon-1',
        code: 'EXPIRED',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        validFrom: new Date(Date.now() - 500000),
        validUntil: expiredDate,
        isActive: true,
        _count: { usages: 0 },
      });

      await expect(couponService.validateCoupon('EXPIRED', 3000)).rejects.toThrow(BadRequestError);
    });

    it('should throw NotFoundError if coupon code does not exist', async () => {
      mockCouponRepo.findByCode.mockResolvedValue(null);

      await expect(couponService.validateCoupon('NONEXISTENT', 1000)).rejects.toThrow(NotFoundError);
    });
  });
});
