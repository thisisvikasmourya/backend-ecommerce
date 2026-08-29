import { Router } from 'express';
import { couponController } from './coupon.controller.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import {
  createCouponSchema,
  updateCouponSchema,
  getCouponByIdSchema,
  validateCouponSchema,
} from './coupon.schema.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { authorize } from '../../common/middleware/rbac.middleware.js';
import { Roles } from '../../common/constants/roles.js';

const router = Router();

// Validate a coupon (Authenticated customer or public)
router.post('/validate', validate(validateCouponSchema), (req, res, next) =>
  couponController.validateCoupon(req, res).catch(next),
);

// Admin-protected CRUD endpoints
router.use(authenticate);
router.use(authorize(Roles.ADMIN, Roles.SUPER_ADMIN, Roles.MANAGER));

router.get('/', (req, res, next) => couponController.getCoupons(req, res).catch(next));
router.get('/:id', validate(getCouponByIdSchema), (req, res, next) =>
  couponController.getCouponById(req, res).catch(next),
);
router.post('/', validate(createCouponSchema), (req, res, next) =>
  couponController.createCoupon(req, res).catch(next),
);
router.patch('/:id', validate(updateCouponSchema), (req, res, next) =>
  couponController.updateCoupon(req, res).catch(next),
);
router.delete(
  '/:id',
  authorize(Roles.ADMIN, Roles.SUPER_ADMIN),
  validate(getCouponByIdSchema),
  (req, res, next) => couponController.deleteCoupon(req, res).catch(next),
);

export const couponRoutes = router;
