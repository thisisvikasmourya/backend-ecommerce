import { orderRepository, OrderRepository } from './order.repository.js';
import { cartRepository, CartRepository } from '../cart/cart.repository.js';
import { productRepository, ProductRepository } from '../products/product.repository.js';
import { addressRepository, AddressRepository } from '../addresses/address.repository.js';
import { inventoryService, InventoryService } from '../inventory/inventory.service.js';
import { couponService, CouponService } from '../coupons/coupon.service.js';
import { CreateOrderInput, ListOrdersQuery } from './order.schema.js';
import { OrderStatus } from '@prisma/client';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../common/errors/app-error.js';
import { ErrorCodes } from '../../common/errors/error-codes.js';
import { prisma } from '../../config/database.js';

export class OrderService {
  constructor(
    private readonly repo: OrderRepository = orderRepository,
    private readonly cartRepo: CartRepository = cartRepository,
    private readonly productRepo: ProductRepository = productRepository,
    private readonly addressRepo: AddressRepository = addressRepository,
    private readonly inventorySvc: InventoryService = inventoryService,
    private readonly couponSvc: CouponService = couponService,
  ) {}

  public async createOrder(userId: string, input: CreateOrderInput) {
    // 1. Resolve Address Snapshot
    let addressSnapshot: Record<string, any>;
    if (input.addressId) {
      const address = await this.addressRepo.findById(input.addressId);
      if (!address || address.userId !== userId) {
        throw new NotFoundError('Address not found', ErrorCodes.NOT_FOUND);
      }
      addressSnapshot = {
        street: address.street,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
      };
    } else if (input.shippingAddress) {
      addressSnapshot = input.shippingAddress;
    } else {
      throw new BadRequestError('Shipping address is required', ErrorCodes.BAD_REQUEST);
    }

    // 2. Resolve Items to Checkout
    let itemsToProcess: { variantId: string; quantity: number }[] = [];
    if (input.items && input.items.length > 0) {
      itemsToProcess = input.items;
    } else {
      const cart = await this.cartRepo.getOrCreateCart(userId);
      if (!cart.items || cart.items.length === 0) {
        throw new BadRequestError(
          'Cart is empty. Cannot place an empty order.',
          ErrorCodes.CART_EMPTY,
        );
      }
      itemsToProcess = cart.items.map((item: any) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      }));
    }

    // 3. Validate Variants, Prices, and Stock
    const processedItems: {
      variantId: string;
      productName: string;
      sku: string;
      unitPrice: number;
      quantity: number;
      discount: number;
      tax: number;
      total: number;
    }[] = [];

    let subtotal = 0;

    for (const item of itemsToProcess) {
      const variant = await this.productRepo.findVariantById(item.variantId);
      if (!variant || !(variant as any).product.isActive) {
        throw new NotFoundError(
          `Product variant ${item.variantId} not found or inactive`,
          ErrorCodes.VARIANT_NOT_FOUND,
        );
      }

      const availableStock = (variant as any).inventory?.availableStock ?? 0;
      if (availableStock < item.quantity) {
        throw new BadRequestError(
          `Insufficient stock for ${(variant as any).product.name} (${variant.sku}). Available: ${availableStock}, Requested: ${item.quantity}`,
          ErrorCodes.INSUFFICIENT_STOCK,
        );
      }

      const unitPrice = Number(variant.price);
      const itemTotal = Math.round(unitPrice * item.quantity * 100) / 100;
      subtotal += itemTotal;

      processedItems.push({
        variantId: variant.id,
        productName: (variant as any).product.name,
        sku: variant.sku,
        unitPrice,
        quantity: item.quantity,
        discount: 0,
        tax: 0,
        total: itemTotal,
      });
    }

    // 4. Calculate Discount & Totals
    let discountAmount = 0;
    let validCoupon: any = null;

    if (input.couponCode) {
      const couponRes = await this.couponSvc.validateCoupon(input.couponCode, subtotal, userId);
      discountAmount = couponRes.discountAmount;
      validCoupon = couponRes.coupon;
    }

    const shippingAmount = subtotal > 1000 ? 0 : 50;
    const taxAmount = Math.round((subtotal - discountAmount) * 0.18 * 100) / 100;
    const totalAmount = Math.max(
      0,
      Math.round((subtotal - discountAmount + shippingAmount + taxAmount) * 100) / 100,
    );

    // 5. Execute Atomic Database Transaction
    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const order = await prisma.$transaction(async (tx) => {
      // a. Reserve Stock for each variant
      for (const item of processedItems) {
        await this.inventorySvc.reserveStock(item.variantId, item.quantity, orderNumber, tx);
      }

      // b. Create Order Record
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status: 'PENDING',
          totalAmount,
          discountAmount,
          shippingAmount,
          taxAmount,
          addressSnapshot,
          items: {
            create: processedItems.map((item) => ({
              variantId: item.variantId,
              productName: item.productName,
              sku: item.sku,
              unitPrice: item.unitPrice,
              quantity: item.quantity,
              discount: item.discount,
              tax: item.tax,
              total: item.total,
            })),
          },
          payments: {
            create: {
              amount: totalAmount,
              currency: 'INR',
              status: 'PENDING',
              provider: 'STRIPE',
            },
          },
        },
        include: {
          items: true,
          payments: true,
        },
      });

      // c. Record Coupon Usage if applied
      if (validCoupon) {
        await this.couponSvc.recordCouponUsage(validCoupon.id, userId, newOrder.id, tx);
      }

      // d. Clear User Cart
      const cart = await tx.cart.findUnique({ where: { userId } });
      if (cart) {
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      }

      return newOrder;
    });

    return order;
  }

  public async getOrderById(identifier: string, userId?: string, isAdmin: boolean = false) {
    const order = await this.repo.findByIdOrOrderNumber(identifier);
    if (!order) {
      throw new NotFoundError('Order not found', ErrorCodes.ORDER_NOT_FOUND);
    }

    if (!isAdmin && userId && order.userId !== userId) {
      throw new ForbiddenError('You do not have access to this order');
    }

    return order;
  }

  public async listOrders(query: ListOrdersQuery, userId?: string) {
    return this.repo.findMany({
      userId,
      status: query.status as OrderStatus,
      page: query.page,
      limit: query.limit,
    });
  }

  public async cancelOrder(identifier: string, userId?: string, isAdmin: boolean = false) {
    const order = await this.getOrderById(identifier, userId, isAdmin);

    if (order.status === 'CANCELLED') {
      throw new BadRequestError('Order is already cancelled', ErrorCodes.ORDER_CANNOT_BE_CANCELLED);
    }

    if (['SHIPPED', 'DELIVERED', 'RETURNED'].includes(order.status)) {
      throw new BadRequestError(
        `Cannot cancel order with current status: ${order.status}`,
        ErrorCodes.ORDER_CANNOT_BE_CANCELLED,
      );
    }

    return prisma.$transaction(async (tx) => {
      // Release inventory for items if order was PENDING or CONFIRMED
      for (const item of order.items) {
        if (item.variantId) {
          if (order.status === 'PENDING') {
            await this.inventorySvc.releaseStock(
              item.variantId,
              item.quantity,
              order.orderNumber,
              tx,
            );
          } else if (order.status === 'CONFIRMED' || order.status === 'PROCESSING') {
            // Restore from sold to available
            const inv = await tx.inventory.findUnique({ where: { variantId: item.variantId } });
            if (inv) {
              await tx.inventory.update({
                where: { id: inv.id },
                data: {
                  availableStock: inv.availableStock + item.quantity,
                  soldStock: Math.max(0, inv.soldStock - item.quantity),
                  movements: {
                    create: {
                      quantity: item.quantity,
                      type: 'RETURNED',
                      referenceId: order.orderNumber,
                      notes: `Cancelled order ${order.orderNumber}, restored to available stock`,
                    },
                  },
                },
              });
            }
          }
        }
      }

      // Update payment status
      await tx.payment.updateMany({
        where: { orderId: order.id },
        data: { status: 'REFUNDED' },
      });

      // Update order status
      return tx.order.update({
        where: { id: order.id },
        data: { status: 'CANCELLED' },
        include: {
          items: true,
          payments: true,
        },
      });
    });
  }

  public async updateOrderStatus(identifier: string, newStatus: OrderStatus) {
    const order = await this.getOrderById(identifier, undefined, true);
    return this.repo.updateStatus(order.id, newStatus);
  }
}

export const orderService = new OrderService();
