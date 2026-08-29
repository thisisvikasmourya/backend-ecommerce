import { Router } from 'express';
import { productController } from './product.controller.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import {
  createProductSchema,
  updateProductSchema,
  getProductsQuerySchema,
  getProductByIdSchema,
  addVariantSchema,
  updateVariantRouteSchema,
  addImageSchema,
} from './product.schema.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { authorize } from '../../common/middleware/rbac.middleware.js';
import { Roles } from '../../common/constants/roles.js';

const router = Router();

// Public routes
router.get('/', validate(getProductsQuerySchema), (req, res, next) =>
  productController.getProducts(req, res).catch(next),
);
router.get('/:id', validate(getProductByIdSchema), (req, res, next) =>
  productController.getProductById(req, res).catch(next),
);

// Protected Admin/Manager routes
router.post(
  '/',
  authenticate,
  authorize(Roles.ADMIN, Roles.SUPER_ADMIN, Roles.MANAGER),
  validate(createProductSchema),
  (req, res, next) => productController.createProduct(req, res).catch(next),
);

router.patch(
  '/:id',
  authenticate,
  authorize(Roles.ADMIN, Roles.SUPER_ADMIN, Roles.MANAGER),
  validate(updateProductSchema),
  (req, res, next) => productController.updateProduct(req, res).catch(next),
);

router.delete(
  '/:id',
  authenticate,
  authorize(Roles.ADMIN, Roles.SUPER_ADMIN),
  validate(getProductByIdSchema),
  (req, res, next) => productController.deleteProduct(req, res).catch(next),
);

// Variant management routes
router.post(
  '/:id/variants',
  authenticate,
  authorize(Roles.ADMIN, Roles.SUPER_ADMIN, Roles.MANAGER),
  validate(addVariantSchema),
  (req, res, next) => productController.addVariant(req, res).catch(next),
);

router.patch(
  '/:id/variants/:variantId',
  authenticate,
  authorize(Roles.ADMIN, Roles.SUPER_ADMIN, Roles.MANAGER),
  validate(updateVariantRouteSchema),
  (req, res, next) => productController.updateVariant(req, res).catch(next),
);

router.delete(
  '/:id/variants/:variantId',
  authenticate,
  authorize(Roles.ADMIN, Roles.SUPER_ADMIN),
  (req, res, next) => productController.deleteVariant(req, res).catch(next),
);

// Image management routes
router.post(
  '/:id/images',
  authenticate,
  authorize(Roles.ADMIN, Roles.SUPER_ADMIN, Roles.MANAGER),
  validate(addImageSchema),
  (req, res, next) => productController.addImage(req, res).catch(next),
);

router.delete(
  '/:id/images/:imageId',
  authenticate,
  authorize(Roles.ADMIN, Roles.SUPER_ADMIN),
  (req, res, next) => productController.deleteImage(req, res).catch(next),
);

export const productRoutes = router;
