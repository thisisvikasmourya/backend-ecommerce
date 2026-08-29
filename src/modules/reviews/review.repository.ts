import { prisma } from '../../config/database.js';
import { Review, Prisma } from '@prisma/client';

export class ReviewRepository {
  public async create(data: Prisma.ReviewCreateInput): Promise<Review> {
    return prisma.review.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  public async findById(id: string): Promise<Review | null> {
    return prisma.review.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  public async findByUserAndProduct(userId: string, productId: string): Promise<Review | null> {
    return prisma.review.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });
  }

  public async findByProductId(
    productId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ reviews: any[]; total: number }> {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { productId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.review.count({ where: { productId } }),
    ]);

    return { reviews, total };
  }

  public async getProductRatingStats(productId: string): Promise<{
    averageRating: number;
    totalReviews: number;
    distribution: Record<number, number>;
  }> {
    const reviews = await prisma.review.findMany({
      where: { productId },
      select: { rating: true },
    });

    const totalReviews = reviews.length;
    if (totalReviews === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const sum = reviews.reduce((acc, cur) => acc + cur.rating, 0);
    const averageRating = Math.round((sum / totalReviews) * 10) / 10;

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of reviews) {
      distribution[r.rating] = (distribution[r.rating] || 0) + 1;
    }

    return {
      averageRating,
      totalReviews,
      distribution,
    };
  }

  public async hasPurchasedProduct(userId: string, productId: string): Promise<boolean> {
    const orderItem = await prisma.orderItem.findFirst({
      where: {
        order: {
          userId,
          status: { in: ['DELIVERED', 'CONFIRMED', 'PROCESSING', 'SHIPPED'] },
        },
        variant: {
          productId,
        },
      },
    });

    return !!orderItem;
  }

  public async update(id: string, data: Prisma.ReviewUpdateInput): Promise<Review> {
    return prisma.review.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  public async delete(id: string): Promise<Review> {
    return prisma.review.delete({ where: { id } });
  }
}

export const reviewRepository = new ReviewRepository();
