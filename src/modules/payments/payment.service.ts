import { paymentRepository, PaymentRepository } from './payment.repository.js';
import { orderRepository, OrderRepository } from '../orders/order.repository.js';
import { inventoryService, InventoryService } from '../inventory/inventory.service.js';
import { CreatePaymentInput, WebhookInput } from './payment.schema.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../common/errors/app-error.js';
import { ErrorCodes } from '../../common/errors/error-codes.js';
import { prisma } from '../../config/database.js';

export class PaymentService {
  constructor(
    private readonly repo: PaymentRepository = paymentRepository,
    private readonly orderRepo: OrderRepository = orderRepository,
    private readonly inventorySvc: InventoryService = inventoryService,
  ) {}

  public async createPayment(
    userId: string,
    input: CreatePaymentInput,
    headerIdempotencyKey?: string,
  ) {
    const idempotencyKey = input.idempotencyKey || headerIdempotencyKey;

    if (idempotencyKey) {
      const existing = await this.repo.findByIdempotencyKey(idempotencyKey);
      if (existing) {
        return existing;
      }
    }

    const order = await this.orderRepo.findByIdOrOrderNumber(input.orderId);
    if (!order) {
      throw new NotFoundError('Order not found', ErrorCodes.ORDER_NOT_FOUND);
    }

    if (order.userId !== userId) {
      throw new ForbiddenError('You do not have permission to pay for this order');
    }

    if (order.status !== 'PENDING') {
      throw new BadRequestError(
        `Cannot initiate payment for order with status: ${order.status}`,
        ErrorCodes.BAD_REQUEST,
      );
    }

    // Check if a payment already exists for this order
    const existingPayment = await this.repo.findByOrderId(order.id);
    if (existingPayment && existingPayment.status === 'PENDING') {
      return existingPayment;
    }

    return this.repo.create({
      order: { connect: { id: order.id } },
      amount: order.totalAmount,
      currency: 'INR',
      status: 'PENDING',
      provider: input.provider || 'STRIPE',
      idempotencyKey,
    });
  }

  public async getPaymentById(id: string, userId?: string, isAdmin: boolean = false) {
    const payment = await this.repo.findById(id);
    if (!payment) {
      throw new NotFoundError('Payment record not found', ErrorCodes.NOT_FOUND);
    }

    if (!isAdmin && userId && payment.order.userId !== userId) {
      throw new ForbiddenError('You do not have access to this payment record');
    }

    return payment;
  }

  public async handleWebhook(payload: WebhookInput, signature?: string) {
    let payment: any = null;

    if (payload.paymentId) {
      payment = await this.repo.findById(payload.paymentId);
    } else if (payload.orderId) {
      const order = await this.orderRepo.findByIdOrOrderNumber(payload.orderId);
      if (order) {
        payment = await this.repo.findByOrderId(order.id);
      }
    }

    if (!payment) {
      throw new NotFoundError(
        'Associated payment not found for webhook event',
        ErrorCodes.NOT_FOUND,
      );
    }

    // If payment is already completed or refunded, return idempotent success
    if (payment.status === 'SUCCESS' || payment.status === 'REFUNDED') {
      return { received: true, status: payment.status };
    }

    return prisma.$transaction(async (tx) => {
      const newStatus = payload.status === 'SUCCESS' ? 'SUCCESS' : 'FAILED';

      // 1. Update Payment record & create transaction
      const updatedPayment = await this.repo.updateStatus(
        payment.id,
        newStatus,
        {
          transactionId: payload.transactionId,
          gatewayStatus: payload.status,
          rawResponse: {
            event: payload.event,
            signature,
            processedAt: new Date().toISOString(),
          },
        },
        tx,
      );

      // 2. If Payment succeeded, confirm Order & transition stock from RESERVED to SOLD
      if (newStatus === 'SUCCESS') {
        const order = await tx.order.findUnique({
          where: { id: payment.orderId },
          include: { items: true },
        });

        if (order) {
          await tx.order.update({
            where: { id: order.id },
            data: { status: 'CONFIRMED' },
          });

          for (const item of order.items) {
            if (item.variantId) {
              await this.inventorySvc.confirmSold(
                item.variantId,
                item.quantity,
                order.orderNumber,
                tx,
              );
            }
          }
        }
      }

      return { received: true, payment: updatedPayment };
    });
  }

  public async refundPayment(paymentId: string, reason?: string) {
    const payment = await this.repo.findById(paymentId);
    if (!payment) {
      throw new NotFoundError('Payment not found', ErrorCodes.NOT_FOUND);
    }

    if (payment.status !== 'SUCCESS') {
      throw new BadRequestError('Only successful payments can be refunded', ErrorCodes.BAD_REQUEST);
    }

    return prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: paymentId },
        data: { status: 'REFUNDED' },
      });

      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: 'REFUNDED' },
      });

      await this.repo.createTransaction(
        paymentId,
        {
          transactionId: `REFUND-${Date.now()}`,
          gatewayStatus: 'REFUNDED',
          rawResponse: { reason: reason || 'Admin initiated refund' },
        },
        tx,
      );

      return { success: true, message: 'Payment refunded successfully' };
    });
  }
}

export const paymentService = new PaymentService();
