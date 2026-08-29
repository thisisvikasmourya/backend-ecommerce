import { Router } from 'express';
import { inventoryController } from './inventory.controller.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import {
  restockSchema,
  getInventoryByVariantSchema,
  getLowStockQuerySchema,
} from './inventory.schema.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { authorize } from '../../common/middleware/rbac.middleware.js';
import { Roles } from '../../common/constants/roles.js';

const router = Router();

// All inventory management routes are restricted to Admin/Manager
router.use(authenticate);
router.use(authorize(Roles.ADMIN, Roles.SUPER_ADMIN, Roles.MANAGER));

router.get('/', (req, res, next) => inventoryController.getAllInventory(req, res).catch(next));
router.get('/low-stock', validate(getLowStockQuerySchema), (req, res, next) =>
  inventoryController.getLowStock(req, res).catch(next),
);
router.get('/:variantId', validate(getInventoryByVariantSchema), (req, res, next) =>
  inventoryController.getInventoryByVariant(req, res).catch(next),
);
router.post('/restock', validate(restockSchema), (req, res, next) =>
  inventoryController.restock(req, res).catch(next),
);

export const inventoryRoutes = router;
