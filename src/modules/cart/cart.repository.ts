import { prisma } from '../../config/database.js';
import { Cart, CartItem, Prisma } from '@prisma/client';

export class CartRepository {
  public async getOrCreateCart(userId: string): Promise<any> {
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: true,
                  },
                },
                inventory: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    include: {
                      images: true,
                    },
                  },
                  inventory: true,
                },
              },
            },
          },
        },
      });
    }

    return cart;
  }

  public async findCartItem(cartId: string, variantId: string): Promise<CartItem | null> {
    return prisma.cartItem.findUnique({
      where: {
        cartId_variantId: {
          cartId,
          variantId,
        },
      },
    });
  }

  public async findCartItemById(itemId: string): Promise<CartItem | null> {
    return prisma.cartItem.findUnique({
      where: { id: itemId },
    });
  }

  public async addItem(cartId: string, variantId: string, quantity: number): Promise<CartItem> {
    return prisma.cartItem.create({
      data: {
        cartId,
        variantId,
        quantity,
      },
    });
  }

  public async updateItemQuantity(itemId: string, quantity: number): Promise<CartItem> {
    return prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
  }

  public async removeItem(itemId: string): Promise<CartItem> {
    return prisma.cartItem.delete({
      where: { id: itemId },
    });
  }

  public async clearCart(
    cartId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<Prisma.BatchPayload> {
    const client = tx || prisma;
    return client.cartItem.deleteMany({
      where: { cartId },
    });
  }
}

export const cartRepository = new CartRepository();
