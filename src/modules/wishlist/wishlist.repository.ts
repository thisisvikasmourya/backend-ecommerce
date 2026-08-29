import { prisma } from '../../config/database.js';
import { Wishlist, WishlistItem } from '@prisma/client';

export class WishlistRepository {
  public async getOrCreateWishlist(userId: string): Promise<any> {
    let wishlist = await prisma.wishlist.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
                brand: true,
                images: true,
                variants: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: true,
                  brand: true,
                  images: true,
                  variants: true,
                },
              },
            },
          },
        },
      });
    }

    return wishlist;
  }

  public async addItem(wishlistId: string, productId: string): Promise<WishlistItem> {
    return prisma.wishlistItem.upsert({
      where: {
        wishlistId_productId: {
          wishlistId,
          productId,
        },
      },
      update: {},
      create: {
        wishlistId,
        productId,
      },
    });
  }

  public async removeItem(wishlistId: string, productId: string): Promise<WishlistItem | null> {
    try {
      return await prisma.wishlistItem.delete({
        where: {
          wishlistId_productId: {
            wishlistId,
            productId,
          },
        },
      });
    } catch {
      return null;
    }
  }
}

export const wishlistRepository = new WishlistRepository();
