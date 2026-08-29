import { adminRepository, AdminRepository } from './admin.repository.js';
import { orderService, OrderService } from '../orders/order.service.js';
import {
  AdminUserQuery,
  AdminOrderQuery,
  UpdateUserRoleInput,
  UpdateUserStatusInput,
} from './admin.schema.js';
import { OrderStatus } from '@prisma/client';
import { NotFoundError } from '../../common/errors/app-error.js';
import { ErrorCodes } from '../../common/errors/error-codes.js';

export class AdminService {
  constructor(
    private readonly repo: AdminRepository = adminRepository,
    private readonly orderSvc: OrderService = orderService,
  ) {}

  public async getDashboardStats() {
    return this.repo.getDashboardStats();
  }

  public async listUsers(query: AdminUserQuery) {
    return this.repo.findUsers(query);
  }

  public async updateUserRole(userId: string, input: UpdateUserRoleInput) {
    return this.repo.updateUserRole(userId, input.role);
  }

  public async updateUserStatus(userId: string, input: UpdateUserStatusInput) {
    return this.repo.updateUserStatus(userId, input.isActive);
  }

  public async listOrders(query: AdminOrderQuery) {
    return this.repo.findOrders(query);
  }

  public async updateOrderStatus(orderId: string, status: OrderStatus) {
    return this.orderSvc.updateOrderStatus(orderId, status);
  }

  public async listAuditLogs(params: {
    page?: number;
    limit?: number;
    entity?: string;
    userId?: string;
  }) {
    return this.repo.findAuditLogs(params);
  }

  public async logAction(data: {
    userId?: string;
    action: string;
    entity: string;
    entityId: string;
    metadata?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.repo.createAuditLog(data);
  }
}

export const adminService = new AdminService();
