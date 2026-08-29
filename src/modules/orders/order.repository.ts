import { prisma } from '../../config/database.js';
import { Order, OrderStatus, Prisma } from '@prisma/client';

export class OrderRepository {
  public async create(
    data: Prisma.OrderCreateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<Order> {
    const client = tx || prisma;
    return client.order.create({
      data,
      include: {
        items: true,
        payments: true,
      },
    });
  }

  public async findByIdOrOrderNumber(identifier: string): Promise<any | null> {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(identifier);

    return prisma.order.findFirst({
      where: isUuid
        ? { OR: [{ id: identifier }, { orderNumber: identifier }] }
        : { orderNumber: identifier },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: { images: true },
                },
              },
            },
          },
        },
        payments: {
          include: {
            transactions: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });
  }

  public async findMany(params: {
    userId?: string;
    status?: OrderStatus;
    page?: number;
    limit?: number;
  }): Promise<{ orders: any[]; total: number }> {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};
    if (params.userId) where.userId = params.userId;
    if (params.status) where.status = params.status;

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

  public async updateStatus(
    id: string,
    status: OrderStatus,
    tx?: Prisma.TransactionClient,
  ): Promise<Order> {
    const client = tx || prisma;
    return client.order.update({
      where: { id },
      data: { status },
      include: {
        items: true,
        payments: true,
      },
    });
  }
}

export const orderRepository = new OrderRepository();
