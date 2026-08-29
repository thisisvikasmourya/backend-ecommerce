import { prisma } from '../../config/database.js';
import { AuditLog, Prisma, Role, OrderStatus } from '@prisma/client';
import { AdminUserFilterQuery, AdminOrderFilterQuery } from './admin.types.js';

export class AdminRepository {
  public async getDashboardStats(): Promise<any> {
    const [
      totalOrders,
      completedOrders,
      pendingOrders,
      revenueResult,
      totalUsers,
      totalProducts,
      lowStockCount,
      recentOrders,
      topVariants,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({
        where: { status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] } },
      }),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.aggregate({
        where: { status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] } },
        _sum: { totalAmount: true },
      }),
      prisma.user.count(),
      prisma.product.count(),
      prisma.inventory.count({ where: { availableStock: { lte: 10 } } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.inventory.findMany({
        take: 5,
        orderBy: { soldStock: 'desc' },
        include: {
          variant: {
            include: {
              product: true,
            },
          },
        },
      }),
    ]);

    return {
      metrics: {
        totalRevenue: Number(revenueResult._sum.totalAmount || 0),
        totalOrders,
        completedOrders,
        pendingOrders,
        totalUsers,
        totalProducts,
        lowStockCount,
      },
      recentOrders,
      topSellingProducts: topVariants.map((item) => ({
        productName: item.variant.product.name,
        sku: item.variant.sku,
        soldUnits: item.soldStock,
        price: Number(item.variant.price),
      })),
    };
  }

  public async findUsers(query: AdminUserFilterQuery): Promise<{ users: any[]; total: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};
    if (query.role) where.role = query.role;
    if (query.isActive !== undefined) where.isActive = query.isActive;
    if (query.search) {
      where.OR = [
        { email: { contains: query.search, mode: 'insensitive' } },
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: {
              orders: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total };
  }

  public async updateUserRole(id: string, role: Role): Promise<any> {
    return prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });
  }

  public async updateUserStatus(id: string, isActive: boolean): Promise<any> {
    return prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });
  }

  public async findOrders(query: AdminOrderFilterQuery): Promise<{ orders: any[]; total: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }
    if (query.search) {
      where.OR = [
        { orderNumber: { contains: query.search, mode: 'insensitive' } },
        { user: { email: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: true,
          payments: true,
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);

    return { orders, total };
  }

  public async createAuditLog(data: Prisma.AuditLogCreateInput): Promise<AuditLog> {
    return prisma.auditLog.create({ data });
  }

  public async findAuditLogs(params: {
    page?: number;
    limit?: number;
    entity?: string;
    userId?: string;
  }): Promise<{ logs: AuditLog[]; total: number }> {
    const page = params.page || 1;
    const limit = params.limit || 50;
    const skip = (page - 1) * limit;

    const where: Prisma.AuditLogWhereInput = {};
    if (params.entity) where.entity = params.entity;
    if (params.userId) where.userId = params.userId;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { logs, total };
  }
}

export const adminRepository = new AdminRepository();
