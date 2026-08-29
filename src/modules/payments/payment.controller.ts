import { Request, Response } from 'express';
import { paymentService, PaymentService } from './payment.service.js';
import { sendCreated, sendSuccess } from '../../common/utils/response.js';
import { UnauthorizedError } from '../../common/errors/app-error.js';
import { Roles } from '../../common/constants/roles.js';

export class PaymentController {
  constructor(private readonly service: PaymentService = paymentService) {}

  public async createPayment(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const idempotencyKey = req.headers['idempotency-key'] as string | undefined;
    const payment = await this.service.createPayment(req.user.id, req.body, idempotencyKey);
    sendCreated(res, payment);
  }

  public async getPaymentById(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const isAdmin = [Roles.ADMIN, Roles.SUPER_ADMIN, Roles.MANAGER].includes(req.user.role as any);
    const payment = await this.service.getPaymentById(req.params.id, req.user.id, isAdmin);
    sendSuccess(res, payment);
  }

  public async handleWebhook(req: Request, res: Response): Promise<void> {
    const signature = req.headers['stripe-signature'] || req.headers['x-webhook-signature'];
    const result = await this.service.handleWebhook(req.body, signature as string | undefined);
    sendSuccess(res, result);
  }

  public async refundPayment(req: Request, res: Response): Promise<void> {
    const result = await this.service.refundPayment(req.params.id, req.body.reason);
    sendSuccess(res, result);
  }
}

export const paymentController = new PaymentController();
