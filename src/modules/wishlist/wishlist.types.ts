import { Wishlist, WishlistItem, Product } from '@prisma/client';

export type { Wishlist, WishlistItem };

export interface WishlistWithItems extends Wishlist {
  items: (WishlistItem & {
    product: Product & {
      category: any;
      brand: any;
      images: any[];
      variants: any[];
    };
  })[];
}
