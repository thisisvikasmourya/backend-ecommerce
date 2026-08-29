import { Cart, CartItem, ProductVariant, Product, ProductImage } from '@prisma/client';

export interface PopulatedCartItem extends CartItem {
  variant: ProductVariant & {
    product: Product & {
      images: ProductImage[];
    };
    inventory?: {
      availableStock: number;
    } | null;
  };
}

export interface CartResponse {
  id: string;
  userId: string;
  items: {
    id: string;
    variantId: string;
    productId: string;
    productName: string;
    productSlug: string;
    productImage?: string | null;
    sku: string;
    color?: string | null;
    size?: string | null;
    unitPrice: number;
    quantity: number;
    itemTotal: number;
    availableStock: number;
    inStock: boolean;
  }[];
  summary: {
    itemCount: number;
    subtotal: number;
    discountAmount: number;
    shippingFee: number;
    taxAmount: number;
    totalAmount: number;
    appliedCoupon?: {
      code: string;
      discountType: string;
      discountValue: number;
      savings: number;
    } | null;
  };
}
