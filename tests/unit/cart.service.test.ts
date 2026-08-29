import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CartService } from '../../src/modules/cart/cart.service.js';
import { BadRequestError, NotFoundError } from '../../src/common/errors/app-error.js';

describe('CartService', () => {
  let cartService: CartService;
  let mockCartRepo: any;
  let mockProductRepo: any;
  let mockCouponSvc: any;

  beforeEach(() => {
    mockCartRepo = {
      getOrCreateCart: vi.fn(),
      findCartItem: vi.fn(),
      findCartItemById: vi.fn(),
      addItem: vi.fn(),
      updateItemQuantity: vi.fn(),
      removeItem: vi.fn(),
      clearCart: vi.fn(),
    };
    mockProductRepo = {
      findVariantById: vi.fn(),
    };
    mockCouponSvc = {
      validateCoupon: vi.fn(),
    };
    cartService = new CartService(mockCartRepo, mockProductRepo, mockCouponSvc);
  });

  describe('getCart', () => {
    it('should return computed cart summary with item totals, tax, and shipping', async () => {
      mockCartRepo.getOrCreateCart.mockResolvedValue({
        id: 'cart-1',
        userId: 'user-1',
        items: [
          {
            id: 'item-1',
            variantId: 'var-1',
            quantity: 2,
            variant: {
              id: 'var-1',
              productId: 'prod-1',
              sku: 'AIRMAX-8',
              price: 500,
              color: 'Black',
              size: '8',
              product: {
                name: 'Nike Shoes',
                slug: 'nike-shoes',
                images: [{ url: 'https://img.com/1.png', isPrimary: true }],
              },
              inventory: { availableStock: 10 },
            },
          },
        ],
      });

      const result = await cartService.getCart('user-1');

      expect(result.summary.itemCount).toBe(2);
      expect(result.summary.subtotal).toBe(1000);
      expect(result.summary.shippingFee).toBe(50); // <= 1000 is 50
      expect(result.summary.taxAmount).toBe(180); // 18% of 1000
      expect(result.summary.totalAmount).toBe(1230);
      expect(result.items[0].inStock).toBe(true);
    });
  });

  describe('addItem', () => {
    it('should throw BadRequestError if requested quantity exceeds available stock', async () => {
      mockProductRepo.findVariantById.mockResolvedValue({
        id: 'var-1',
        product: { isActive: true },
        inventory: { availableStock: 2 },
      });

      await expect(
        cartService.addItem('user-1', { variantId: 'var-1', quantity: 5 }),
      ).rejects.toThrow(BadRequestError);
    });

    it('should throw NotFoundError if product variant does not exist', async () => {
      mockProductRepo.findVariantById.mockResolvedValue(null);

      await expect(
        cartService.addItem('user-1', { variantId: 'var-nonexistent', quantity: 1 }),
      ).rejects.toThrow(NotFoundError);
    });
  });
});
