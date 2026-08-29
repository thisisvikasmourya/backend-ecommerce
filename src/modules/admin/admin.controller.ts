import { Request, Response } from 'express';
import { adminService, AdminService } from './admin.service.js';
import { sendPaginated, sendSuccess } from '../../common/utils/response.js';

export class AdminController {
  constructor(private readonly service: AdminService = adminService) {}

  public async getDashboardStats(_req: Request, res: Response): Promise<void> {
    const stats = await this.service.getDashboardStats();
    sendSuccess(res, stats);
  }

  public async listUsers(req: Request, res: Response): Promise<void> {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await this.service.listUsers(req.query as any);
    sendPaginated(res, result.users, { page, limit, total: result.total });
  }

  public async updateUserRole(req: Request, res: Response): Promise<void> {
    const user = await this.service.updateUserRole(req.params.id, req.body);
    sendSuccess(res, user);
  }

  public async updateUserStatus(req: Request, res: Response): Promise<void> {
    const user = await this.service.updateUserStatus(req.params.id, req.body);
    sendSuccess(res, user);
  }

  public async listOrders(req: Request, res: Response): Promise<void> {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await this.service.listOrders(req.query as any);
    sendPaginated(res, result.orders, { page, limit, total: result.total });
  }

  public async updateOrderStatus(req: Request, res: Response): Promise<void> {
    const order = await this.service.updateOrderStatus(req.params.id, req.body.status);
    sendSuccess(res, order);
  }

  public async listAuditLogs(req: Request, res: Response): Promise<void> {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;
    const result = await this.service.listAuditLogs({
      page,
      limit,
      entity: req.query.entity as string,
      userId: req.query.userId as string,
    });
    sendPaginated(res, result.logs, { page, limit, total: result.total });
  }
}

export const adminController = new AdminController();
