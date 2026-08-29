import { Request, Response } from 'express';
import { orderService, OrderService } from './order.service.js';
import { sendCreated, sendPaginated, sendSuccess } from '../../common/utils/response.js';
import { UnauthorizedError } from '../../common/errors/app-error.js';
import { Roles } from '../../common/constants/roles.js';

export class OrderController {
  constructor(private readonly service: OrderService = orderService) {}

  public async createOrder(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const order = await this.service.createOrder(req.user.id, req.body);
    sendCreated(res, order);
  }

  public async getOrderById(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const isAdmin = [Roles.ADMIN, Roles.SUPER_ADMIN, Roles.MANAGER].includes(req.user.role as any);
    const order = await this.service.getOrderById(req.params.id, req.user.id, isAdmin);
    sendSuccess(res, order);
  }

  public async listOrders(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const result = await this.service.listOrders(req.query as any, req.user.id);
    sendPaginated(res, result.orders, {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      total: result.total,
    });
  }

  public async cancelOrder(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const isAdmin = [Roles.ADMIN, Roles.SUPER_ADMIN, Roles.MANAGER].includes(req.user.role as any);
    const order = await this.service.cancelOrder(req.params.id, req.user.id, isAdmin);
    sendSuccess(res, order);
  }
}

export const orderController = new OrderController();
