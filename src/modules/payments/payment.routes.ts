import { Router } from 'express';
import { paymentController } from './payment.controller.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import {
  createPaymentSchema,
  getPaymentByIdSchema,
  webhookPayloadSchema,
  refundPaymentSchema,
} from './payment.schema.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';
import { authorize } from '../../common/middleware/rbac.middleware.js';
import { Roles } from '../../common/constants/roles.js';

const router = Router();

// Webhook endpoint (must be accessible by payment gateway providers)
router.post('/webhook', validate(webhookPayloadSchema), (req, res, next) =>
  paymentController.handleWebhook(req, res).catch(next),
);

// Authenticated user endpoints
router.use(authenticate);

router.post('/create', validate(createPaymentSchema), (req, res, next) =>
  paymentController.createPayment(req, res).catch(next),
);

router.get('/:id', validate(getPaymentByIdSchema), (req, res, next) =>
  paymentController.getPaymentById(req, res).catch(next),
);

// Admin-only refund endpoint
router.post(
  '/:id/refund',
  authorize(Roles.ADMIN, Roles.SUPER_ADMIN),
  validate(refundPaymentSchema),
  (req, res, next) => paymentController.refundPayment(req, res).catch(next),
);

export const paymentRoutes = router;
