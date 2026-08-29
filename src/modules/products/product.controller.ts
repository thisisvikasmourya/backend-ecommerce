import { Request, Response } from 'express';
import { productService, ProductService } from './product.service.js';
import { sendCreated, sendPaginated, sendSuccess } from '../../common/utils/response.js';

export class ProductController {
  constructor(private readonly service: ProductService = productService) {}

  public async getProducts(req: Request, res: Response): Promise<void> {
    const result = await this.service.getProducts(req.query as any);
    sendPaginated(res, result.products, {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      total: result.total,
    });
  }

  public async getProductById(req: Request, res: Response): Promise<void> {
    const product = await this.service.getProductByIdOrSlug(req.params.id);
    sendSuccess(res, product);
  }

  public async createProduct(req: Request, res: Response): Promise<void> {
    const product = await this.service.createProduct(req.body);
    sendCreated(res, product);
  }

  public async updateProduct(req: Request, res: Response): Promise<void> {
    const product = await this.service.updateProduct(req.params.id, req.body);
    sendSuccess(res, product);
  }

  public async deleteProduct(req: Request, res: Response): Promise<void> {
    await this.service.deleteProduct(req.params.id);
    sendSuccess(res, { message: 'Product deleted successfully' });
  }

  public async addVariant(req: Request, res: Response): Promise<void> {
    const variant = await this.service.addVariant(req.params.id, req.body);
    sendCreated(res, variant);
  }

  public async updateVariant(req: Request, res: Response): Promise<void> {
    const variant = await this.service.updateVariant(req.params.variantId, req.body);
    sendSuccess(res, variant);
  }

  public async deleteVariant(req: Request, res: Response): Promise<void> {
    await this.service.deleteVariant(req.params.variantId);
    sendSuccess(res, { message: 'Variant deleted successfully' });
  }

  public async addImage(req: Request, res: Response): Promise<void> {
    const image = await this.service.addImage(req.params.id, req.body);
    sendCreated(res, image);
  }

  public async deleteImage(req: Request, res: Response): Promise<void> {
    await this.service.deleteImage(req.params.imageId);
    sendSuccess(res, { message: 'Image deleted successfully' });
  }
}

export const productController = new ProductController();
