import { Router } from 'express';
import { reviewController } from './review.controller.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import {
  createReviewSchema,
  updateReviewSchema,
  getReviewsQuerySchema,
  reviewParamSchema,
} from './review.schema.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';

const router = Router();

// Public: view reviews of a product
router.get('/products/:productId', validate(getReviewsQuerySchema), (req, res, next) =>
  reviewController.getProductReviews(req, res).catch(next),
);

// Protected: create, update, delete review
router.post('/products/:productId', authenticate, validate(createReviewSchema), (req, res, next) =>
  reviewController.createReview(req, res).catch(next),
);

router.patch('/:id', authenticate, validate(updateReviewSchema), (req, res, next) =>
  reviewController.updateReview(req, res).catch(next),
);

router.delete('/:id', authenticate, validate(reviewParamSchema), (req, res, next) =>
  reviewController.deleteReview(req, res).catch(next),
);

export const reviewRoutes = router;
