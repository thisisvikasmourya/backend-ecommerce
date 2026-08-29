import { emailQueue } from './queues.js';
import { logger } from '../config/logger.js';

export interface OrderConfirmationEmailData {
  to: string;
  orderNumber: string;
  totalAmount: number;
  customerName: string;
  items: { productName: string; quantity: number; unitPrice: number }[];
}

export interface PasswordResetEmailData {
  to: string;
  customerName: string;
  resetLink: string;
}

export async function sendOrderConfirmationEmail(data: OrderConfirmationEmailData): Promise<void> {
  try {
    if (emailQueue) {
      await emailQueue.add('order-confirmation', data);
      logger.info(
        { orderNumber: data.orderNumber, to: data.to },
        '📧 Enqueued order confirmation email',
      );
    } else {
      logger.info({ data }, '📧 [Fallback Direct] Sending simulated order confirmation email');
    }
  } catch (err: any) {
    logger.warn(
      { err: err.message },
      'Failed to enqueue order confirmation email (handled gracefully)',
    );
  }
}

export async function sendPasswordResetEmail(data: PasswordResetEmailData): Promise<void> {
  try {
    if (emailQueue) {
      await emailQueue.add('password-reset', data);
      logger.info({ to: data.to }, '📧 Enqueued password reset email');
    } else {
      logger.info({ data }, '📧 [Fallback Direct] Sending simulated password reset email');
    }
  } catch (err: any) {
    logger.warn({ err: err.message }, 'Failed to enqueue password reset email');
  }
}
