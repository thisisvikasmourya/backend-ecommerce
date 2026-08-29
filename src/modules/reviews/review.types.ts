import { Review, User } from '@prisma/client';

export type { Review };

export interface ReviewWithUser extends Review {
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface ProductReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}
