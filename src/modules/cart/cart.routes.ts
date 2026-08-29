import { Router } from 'express';
import { cartController } from './cart.controller.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import {
  addToCartSchema,
  updateCartItemSchema,
  cartItemParamSchema,
  applyCouponSchema,
} from './cart.schema.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';

const router = Router();

// All cart operations require authentication
router.use(authenticate);

router.get('/', (req, res, next) => cartController.getCart(req, res).catch(next));
router.post('/items', validate(addToCartSchema), (req, res, next) =>
  cartController.addItem(req, res).catch(next),
);
router.patch('/items/:itemId', validate(updateCartItemSchema), (req, res, next) =>
  cartController.updateItemQuantity(req, res).catch(next),
);
router.delete('/items/:itemId', validate(cartItemParamSchema), (req, res, next) =>
  cartController.removeItem(req, res).catch(next),
);
router.delete('/', (req, res, next) => cartController.clearCart(req, res).catch(next));

router.post('/apply-coupon', validate(applyCouponSchema), (req, res, next) =>
  cartController.applyCoupon(req, res).catch(next),
);
router.delete('/coupon', (req, res, next) => cartController.removeCoupon(req, res).catch(next));

export const cartRoutes = router;
