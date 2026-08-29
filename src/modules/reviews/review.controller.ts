import { Request, Response } from 'express';
import { reviewService, ReviewService } from './review.service.js';
import { sendCreated, sendPaginated, sendSuccess } from '../../common/utils/response.js';
import { UnauthorizedError } from '../../common/errors/app-error.js';
import { Roles } from '../../common/constants/roles.js';

export class ReviewController {
  constructor(private readonly service: ReviewService = reviewService) {}

  public async getProductReviews(req: Request, res: Response): Promise<void> {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await this.service.getProductReviews(req.params.productId, page, limit);
    sendPaginated(
      res,
      result.reviews,
      {
        page,
        limit,
        total: result.total,
      },
      200,
    );
  }

  public async createReview(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const review = await this.service.createReview(req.user.id, req.params.productId, req.body);
    sendCreated(res, review);
  }

  public async updateReview(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const review = await this.service.updateReview(req.params.id, req.user.id, req.body);
    sendSuccess(res, review);
  }

  public async deleteReview(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const isAdmin = [Roles.ADMIN, Roles.SUPER_ADMIN].includes(req.user.role as any);
    await this.service.deleteReview(req.params.id, req.user.id, isAdmin);
    sendSuccess(res, { message: 'Review deleted successfully' });
  }
}

export const reviewController = new ReviewController();
