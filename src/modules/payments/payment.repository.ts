import { prisma } from '../../config/database.js';
import { Payment, PaymentTransaction, PaymentStatus, Prisma } from '@prisma/client';

export class PaymentRepository {
  public async create(data: Prisma.PaymentCreateInput): Promise<Payment> {
    return prisma.payment.create({
      data,
      include: { transactions: true },
    });
  }

  public async findById(id: string): Promise<any | null> {
    return prisma.payment.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            items: true,
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        transactions: true,
      },
    });
  }

  public async findByOrderId(orderId: string): Promise<Payment | null> {
    return prisma.payment.findFirst({
      where: { orderId },
      include: { transactions: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async findByIdempotencyKey(key: string): Promise<Payment | null> {
    return prisma.payment.findUnique({
      where: { idempotencyKey: key },
      include: { transactions: true },
    });
  }

  public async updateStatus(
    id: string,
    status: PaymentStatus,
    transaction?: {
      transactionId: string;
      gatewayStatus: string;
      rawResponse?: any;
    },
    tx?: Prisma.TransactionClient,
  ): Promise<Payment> {
    const client = tx || prisma;
    return client.payment.update({
      where: { id },
      data: {
        status,
        transactions: transaction
          ? {
              create: transaction,
            }
          : undefined,
      },
      include: {
        transactions: true,
      },
    });
  }

  public async createTransaction(
    paymentId: string,
    data: {
      transactionId: string;
      gatewayStatus: string;
      rawResponse?: any;
    },
    tx?: Prisma.TransactionClient,
  ): Promise<PaymentTransaction> {
    const client = tx || prisma;
    return client.paymentTransaction.create({
      data: {
        paymentId,
        ...data,
      },
    });
  }
}

export const paymentRepository = new PaymentRepository();
