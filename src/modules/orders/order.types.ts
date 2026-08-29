import { Order, OrderItem, OrderStatus, Payment, User } from '@prisma/client';

export type { Order, OrderItem, OrderStatus };

export interface OrderWithDetails extends Order {
  user?: Partial<User>;
  items: OrderItem[];
  payments?: Payment[];
}

export interface CreateOrderDTO {
  addressId?: string;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  couponCode?: string;
  items?: {
    variantId: string;
    quantity: number;
  }[];
}
