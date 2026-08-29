import { Router } from 'express';
import { orderController } from './order.controller.js';
import { validate } from '../../common/middleware/validate.middleware.js';
import {
  createOrderSchema,
  getOrderByIdSchema,
  listOrdersQuerySchema,
  cancelOrderSchema,
} from './order.schema.js';
import { authenticate } from '../../common/middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/', validate(createOrderSchema), (req, res, next) =>
  orderController.createOrder(req, res).catch(next),
);

router.get('/', validate(listOrdersQuerySchema), (req, res, next) =>
  orderController.listOrders(req, res).catch(next),
);

router.get('/:id', validate(getOrderByIdSchema), (req, res, next) =>
  orderController.getOrderById(req, res).catch(next),
);

router.post('/:id/cancel', validate(cancelOrderSchema), (req, res, next) =>
  orderController.cancelOrder(req, res).catch(next),
);

export const orderRoutes = router;
