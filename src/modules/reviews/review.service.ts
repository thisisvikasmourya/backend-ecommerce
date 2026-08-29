import { reviewRepository, ReviewRepository } from './review.repository.js';
import { productRepository, ProductRepository } from '../products/product.repository.js';
import { CreateReviewInput, UpdateReviewInput } from './review.schema.js';
import { NotFoundError, ConflictError, ForbiddenError } from '../../common/errors/app-error.js';
import { ErrorCodes } from '../../common/errors/error-codes.js';

export class ReviewService {
  constructor(
    private readonly repo: ReviewRepository = reviewRepository,
    private readonly productRepo: ProductRepository = productRepository,
  ) {}

  public async getProductReviews(productId: string, page: number = 1, limit: number = 10) {
    const product = await this.productRepo.findByIdOrSlug(productId);
    if (!product) {
      throw new NotFoundError('Product not found', ErrorCodes.PRODUCT_NOT_FOUND);
    }

    const [reviewsData, stats] = await Promise.all([
      this.repo.findByProductId(product.id, page, limit),
      this.repo.getProductRatingStats(product.id),
    ]);

    return {
      reviews: reviewsData.reviews,
      total: reviewsData.total,
      stats,
    };
  }

  public async createReview(userId: string, productId: string, input: CreateReviewInput) {
    const product = await this.productRepo.findByIdOrSlug(productId);
    if (!product) {
      throw new NotFoundError('Product not found', ErrorCodes.PRODUCT_NOT_FOUND);
    }

    const existing = await this.repo.findByUserAndProduct(userId, product.id);
    if (existing) {
      throw new ConflictError(
        'You have already submitted a review for this product',
        ErrorCodes.CONFLICT,
      );
    }

    const isVerified = await this.repo.hasPurchasedProduct(userId, product.id);

    return this.repo.create({
      user: { connect: { id: userId } },
      product: { connect: { id: product.id } },
      rating: input.rating,
      title: input.title,
      comment: input.comment,
      isVerified,
    });
  }

  public async updateReview(id: string, userId: string, input: UpdateReviewInput) {
    const review = await this.repo.findById(id);
    if (!review) {
      throw new NotFoundError('Review not found', ErrorCodes.NOT_FOUND);
    }

    if (review.userId !== userId) {
      throw new ForbiddenError('You can only update your own review');
    }

    return this.repo.update(id, input);
  }

  public async deleteReview(id: string, userId?: string, isAdmin: boolean = false) {
    const review = await this.repo.findById(id);
    if (!review) {
      throw new NotFoundError('Review not found', ErrorCodes.NOT_FOUND);
    }

    if (!isAdmin && userId && review.userId !== userId) {
      throw new ForbiddenError('You do not have permission to delete this review');
    }

    return this.repo.delete(id);
  }
}

export const reviewService = new ReviewService();
