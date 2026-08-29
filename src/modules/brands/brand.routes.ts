import { Router } from 'express';
import { brandController } from './brand.controller.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import { createBrandSchema, updateBrandSchema, getBrandByIdSchema } from './brand.schema.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { authorize } from '../../common/middleware/rbac.middleware.js';
import { Roles } from '../../common/constants/roles.js';

const router = Router();

// Public routes
router.get('/', (req, res, next) => brandController.getBrands(req, res).catch(next));
router.get('/:id', validate(getBrandByIdSchema), (req, res, next) =>
  brandController.getBrandById(req, res).catch(next),
);

// Protected Admin/Manager routes
router.post(
  '/',
  authenticate,
  authorize(Roles.ADMIN, Roles.SUPER_ADMIN, Roles.MANAGER),
  validate(createBrandSchema),
  (req, res, next) => brandController.createBrand(req, res).catch(next),
);

router.patch(
  '/:id',
  authenticate,
  authorize(Roles.ADMIN, Roles.SUPER_ADMIN, Roles.MANAGER),
  validate(updateBrandSchema),
  (req, res, next) => brandController.updateBrand(req, res).catch(next),
);

router.delete(
  '/:id',
  authenticate,
  authorize(Roles.ADMIN, Roles.SUPER_ADMIN),
  validate(getBrandByIdSchema),
  (req, res, next) => brandController.deleteBrand(req, res).catch(next),
);

export const brandRoutes = router;
