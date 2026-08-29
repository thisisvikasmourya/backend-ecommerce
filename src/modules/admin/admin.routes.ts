import { Router } from 'express';
import { adminController } from './admin.controller.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import {
  adminUserQuerySchema,
  updateUserRoleSchema,
  updateUserStatusSchema,
  adminOrderQuerySchema,
  updateAdminOrderStatusSchema,
  adminAuditLogQuerySchema,
} from './admin.schema.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { authorize } from '../../common/middleware/rbac.middleware.js';
import { Roles } from '../../common/constants/roles.js';

const router = Router();

// Protect all admin routes with authentication and RBAC
router.use(authenticate);
router.use(authorize(Roles.ADMIN, Roles.SUPER_ADMIN, Roles.MANAGER));

// Dashboard metrics
router.get('/dashboard', (req, res, next) =>
  adminController.getDashboardStats(req, res).catch(next),
);

// User Management
router.get('/users', validate(adminUserQuerySchema), (req, res, next) =>
  adminController.listUsers(req, res).catch(next),
);

router.patch(
  '/users/:id/role',
  authorize(Roles.SUPER_ADMIN),
  validate(updateUserRoleSchema),
  (req, res, next) => adminController.updateUserRole(req, res).catch(next),
);

router.patch(
  '/users/:id/status',
  authorize(Roles.ADMIN, Roles.SUPER_ADMIN),
  validate(updateUserStatusSchema),
  (req, res, next) => adminController.updateUserStatus(req, res).catch(next),
);

// Order Management
router.get('/orders', validate(adminOrderQuerySchema), (req, res, next) =>
  adminController.listOrders(req, res).catch(next),
);

router.patch('/orders/:id/status', validate(updateAdminOrderStatusSchema), (req, res, next) =>
  adminController.updateOrderStatus(req, res).catch(next),
);

// Audit Logs
router.get('/audit-logs', validate(adminAuditLogQuerySchema), (req, res, next) =>
  adminController.listAuditLogs(req, res).catch(next),
);

export const adminRoutes = router;
