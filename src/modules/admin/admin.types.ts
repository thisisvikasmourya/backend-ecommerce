import { AuditLog, Role, OrderStatus } from '@prisma/client';

export type { AuditLog };

export interface DashboardStats {
  metrics: {
    totalRevenue: number;
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    totalUsers: number;
    totalProducts: number;
    lowStockCount: number;
  };
  recentOrders: any[];
  topSellingProducts: any[];
}

export interface AdminUserFilterQuery {
  page?: number;
  limit?: number;
  role?: Role;
  isActive?: boolean;
  search?: string;
}

export interface AdminOrderFilterQuery {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  search?: string;
  startDate?: string;
  endDate?: string;
}
