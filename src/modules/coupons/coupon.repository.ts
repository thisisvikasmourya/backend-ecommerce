import { prisma } from '../../config/database.js';
import { Coupon, CouponUsage, Prisma } from '@prisma/client';

export class CouponRepository {
  public async create(data: Prisma.CouponCreateInput): Promise<Coupon> {
    return prisma.coupon.create({ data });
  }

  public async findById(id: string): Promise<Coupon | null> {
    return prisma.coupon.findUnique({
      where: { id },
      include: {
        _count: {
          select: { usages: true },
        },
      },
    });
  }

  public async findByCode(code: string): Promise<Coupon | null> {
    return prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
      include: {
        _count: {
          select: { usages: true },
        },
      },
    });
  }

  public async findAll(includeInactive: boolean = true): Promise<Coupon[]> {
    return prisma.coupon.findMany({
      where: includeInactive ? undefined : { isActive: true },
      include: {
        _count: {
          select: { usages: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async update(id: string, data: Prisma.CouponUpdateInput): Promise<Coupon> {
    return prisma.coupon.update({
      where: { id },
      data,
    });
  }

  public async delete(id: string): Promise<Coupon> {
    return prisma.coupon.delete({ where: { id } });
  }

  public async getUserUsageCount(couponId: string, userId: string): Promise<number> {
    return prisma.couponUsage.count({
      where: { couponId, userId },
    });
  }

  public async recordUsage(
    couponId: string,
    userId: string,
    orderId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<CouponUsage> {
    const client = tx || prisma;
    return client.couponUsage.create({
      data: {
        couponId,
        userId,
        orderId,
      },
    });
  }
}

export const couponRepository = new CouponRepository();
