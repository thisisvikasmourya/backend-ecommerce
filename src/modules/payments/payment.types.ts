import { Payment, PaymentTransaction, PaymentStatus } from '@prisma/client';

export type { Payment, PaymentTransaction, PaymentStatus };

export interface CreatePaymentDTO {
  orderId: string;
  provider?: string;
  idempotencyKey?: string;
}

export interface WebhookPayload {
  event: string;
  paymentId?: string;
  transactionId: string;
  orderId?: string;
  amount: number;
  status: 'SUCCESS' | 'FAILED';
  signature?: string;
  rawPayload?: any;
}
