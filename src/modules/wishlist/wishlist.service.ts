import { wishlistRepository, WishlistRepository } from './wishlist.repository.js';
import { productRepository, ProductRepository } from '../products/product.repository.js';
import { NotFoundError } from '../../common/errors/app-error.js';
import { ErrorCodes } from '../../common/errors/error-codes.js';

export class WishlistService {
  constructor(
    private readonly repo: WishlistRepository = wishlistRepository,
    private readonly productRepo: ProductRepository = productRepository,
  ) {}

  public async getWishlist(userId: string) {
    return this.repo.getOrCreateWishlist(userId);
  }

  public async addItem(userId: string, productId: string) {
    const product = await this.productRepo.findByIdOrSlug(productId);
    if (!product) {
      throw new NotFoundError('Product not found', ErrorCodes.PRODUCT_NOT_FOUND);
    }

    const wishlist = await this.repo.getOrCreateWishlist(userId);
    await this.repo.addItem(wishlist.id, product.id);
    return this.getWishlist(userId);
  }

  public async removeItem(userId: string, productId: string) {
    const wishlist = await this.repo.getOrCreateWishlist(userId);
    await this.repo.removeItem(wishlist.id, productId);
    return this.getWishlist(userId);
  }
}

export const wishlistService = new WishlistService();
