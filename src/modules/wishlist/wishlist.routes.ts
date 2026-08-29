import { Router } from 'express';
import { wishlistController } from './wishlist.controller.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import { wishlistProductParamSchema } from './wishlist.schema.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => wishlistController.getWishlist(req, res).catch(next));
router.post('/:productId', validate(wishlistProductParamSchema), (req, res, next) =>
  wishlistController.addItem(req, res).catch(next),
);
router.delete('/:productId', validate(wishlistProductParamSchema), (req, res, next) =>
  wishlistController.removeItem(req, res).catch(next),
);

export const wishlistRoutes = router;
