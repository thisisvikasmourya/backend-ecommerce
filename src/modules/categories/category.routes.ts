import { Router } from 'express';
import { categoryController } from './category.controller.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import { createCategorySchema, updateCategorySchema, getCategoryByIdSchema } from './category.schema.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { authorize } from '../../common/middleware/rbac.middleware.js';
import { Roles } from '../../common/constants/roles.js';

const router = Router();

// Public routes
router.get('/', (req, res, next) => categoryController.getCategories(req, res).catch(next));
router.get('/:id', validate(getCategoryByIdSchema), (req, res, next) =>
  categoryController.getCategoryById(req, res).catch(next),
);

// Protected Admin/Manager routes
router.post(
  '/',
  authenticate,
  authorize(Roles.ADMIN, Roles.SUPER_ADMIN, Roles.MANAGER),
  validate(createCategorySchema),
  (req, res, next) => categoryController.createCategory(req, res).catch(next),
);

router.patch(
  '/:id',
  authenticate,
  authorize(Roles.ADMIN, Roles.SUPER_ADMIN, Roles.MANAGER),
  validate(updateCategorySchema),
  (req, res, next) => categoryController.updateCategory(req, res).catch(next),
);

router.delete(
  '/:id',
  authenticate,
  authorize(Roles.ADMIN, Roles.SUPER_ADMIN),
  validate(getCategoryByIdSchema),
  (req, res, next) => categoryController.deleteCategory(req, res).catch(next),
);

export const categoryRoutes = router;
