import { cartRepository, CartRepository } from './cart.repository.js';
import { productRepository, ProductRepository } from '../products/product.repository.js';
import { couponService, CouponService } from '../coupons/coupon.service.js';
import { AddToCartInput, UpdateCartItemInput } from './cart.schema.js';
import { CartResponse } from './cart.types.js';
import { NotFoundError, BadRequestError } from '../../common/errors/app-error.js';
import { ErrorCodes } from '../../common/errors/error-codes.js';

export class CartService {
  constructor(
    private readonly repo: CartRepository = cartRepository,
    private readonly productRepo: ProductRepository = productRepository,
    private readonly couponSvc: CouponService = couponService,
  ) {}

  public async getCart(userId: string, couponCode?: string): Promise<CartResponse> {
    const cart = await this.repo.getOrCreateCart(userId);

    const items = cart.items.map((item: any) => {
      const unitPrice = Number(item.variant.price);
      const itemTotal = Math.round(unitPrice * item.quantity * 100) / 100;
      const availableStock = item.variant.inventory?.availableStock ?? 0;
      const primaryImage =
        item.variant.product.images.find((img: any) => img.isPrimary)?.url ||
        item.variant.product.images[0]?.url ||
        null;

      return {
        id: item.id,
        variantId: item.variantId,
        productId: item.variant.productId,
        productName: item.variant.product.name,
        productSlug: item.variant.product.slug,
        productImage: primaryImage,
        sku: item.variant.sku,
        color: item.variant.color,
        size: item.variant.size,
        unitPrice,
        quantity: item.quantity,
        itemTotal,
        availableStock,
        inStock: availableStock >= item.quantity,
      };
    });

    const subtotal =
      Math.round(items.reduce((acc: number, cur: any) => acc + cur.itemTotal, 0) * 100) / 100;
    let discountAmount = 0;
    let appliedCoupon = null;

    if (couponCode && subtotal > 0) {
      try {
        const couponResult = await this.couponSvc.validateCoupon(couponCode, subtotal, userId);
        discountAmount = couponResult.discountAmount;
        appliedCoupon = {
          code: couponResult.coupon.code,
          discountType: couponResult.coupon.discountType,
          discountValue: Number(couponResult.coupon.discountValue),
          savings: discountAmount,
        };
      } catch (err: any) {
        // Return null coupon if invalid
      }
    }

    const shippingFee = subtotal > 1000 || subtotal === 0 ? 0 : 50; // Free shipping over ₹1000
    const taxAmount = Math.round((subtotal - discountAmount) * 0.18 * 100) / 100; // 18% GST estimate
    const totalAmount = Math.max(
      0,
      Math.round((subtotal - discountAmount + shippingFee + taxAmount) * 100) / 100,
    );

    return {
      id: cart.id,
      userId: cart.userId,
      items,
      summary: {
        itemCount: items.reduce((acc: number, cur: any) => acc + cur.quantity, 0),
        subtotal,
        discountAmount,
        shippingFee,
        taxAmount,
        totalAmount,
        appliedCoupon,
      },
    };
  }

  public async addItem(userId: string, input: AddToCartInput): Promise<CartResponse> {
    const variant = await this.productRepo.findVariantById(input.variantId);
    if (!variant || !(variant as any).product.isActive) {
      throw new NotFoundError(
        'Product variant not found or inactive',
        ErrorCodes.VARIANT_NOT_FOUND,
      );
    }

    const availableStock = (variant as any).inventory?.availableStock ?? 0;
    if (availableStock < input.quantity) {
      throw new BadRequestError(
        `Insufficient stock for this product variant. Available: ${availableStock}`,
        ErrorCodes.INSUFFICIENT_STOCK,
      );
    }

    const cart = await this.repo.getOrCreateCart(userId);
    const existingItem = await this.repo.findCartItem(cart.id, input.variantId);

    if (existingItem) {
      const newQuantity = existingItem.quantity + input.quantity;
      if (availableStock < newQuantity) {
        throw new BadRequestError(
          `Cannot add ${input.quantity} more units. Total quantity (${newQuantity}) exceeds available stock (${availableStock})`,
          ErrorCodes.INSUFFICIENT_STOCK,
        );
      }
      await this.repo.updateItemQuantity(existingItem.id, newQuantity);
    } else {
      await this.repo.addItem(cart.id, input.variantId, input.quantity);
    }

    return this.getCart(userId);
  }

  public async updateItemQuantity(
    userId: string,
    itemId: string,
    input: UpdateCartItemInput,
  ): Promise<CartResponse> {
    const cart = await this.repo.getOrCreateCart(userId);
    const item = await this.repo.findCartItemById(itemId);

    if (!item || item.cartId !== cart.id) {
      throw new NotFoundError('Cart item not found', ErrorCodes.NOT_FOUND);
    }

    const variant = await this.productRepo.findVariantById(item.variantId);
    const availableStock = (variant as any)?.inventory?.availableStock ?? 0;

    if (availableStock < input.quantity) {
      throw new BadRequestError(
        `Requested quantity (${input.quantity}) exceeds available stock (${availableStock})`,
        ErrorCodes.INSUFFICIENT_STOCK,
      );
    }

    await this.repo.updateItemQuantity(itemId, input.quantity);
    return this.getCart(userId);
  }

  public async removeItem(userId: string, itemId: string): Promise<CartResponse> {
    const cart = await this.repo.getOrCreateCart(userId);
    const item = await this.repo.findCartItemById(itemId);

    if (!item || item.cartId !== cart.id) {
      throw new NotFoundError('Cart item not found', ErrorCodes.NOT_FOUND);
    }

    await this.repo.removeItem(itemId);
    return this.getCart(userId);
  }

  public async clearCart(userId: string): Promise<void> {
    const cart = await this.repo.getOrCreateCart(userId);
    await this.repo.clearCart(cart.id);
  }

  public async applyCoupon(userId: string, code: string): Promise<CartResponse> {
    return this.getCart(userId, code);
  }
}

export const cartService = new CartService();
