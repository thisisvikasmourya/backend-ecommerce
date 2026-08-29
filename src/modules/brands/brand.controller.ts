import { Request, Response } from 'express';
import { brandService, BrandService } from './brand.service.js';
import { sendCreated, sendSuccess } from '../../common/utils/response.js';

export class BrandController {
  constructor(private readonly service: BrandService = brandService) {}

  public async getBrands(_req: Request, res: Response): Promise<void> {
    const brands = await this.service.getBrands();
    sendSuccess(res, brands);
  }

  public async getBrandById(req: Request, res: Response): Promise<void> {
    const brand = await this.service.getBrandById(req.params.id);
    sendSuccess(res, brand);
  }

  public async createBrand(req: Request, res: Response): Promise<void> {
    const brand = await this.service.createBrand(req.body);
    sendCreated(res, brand);
  }

  public async updateBrand(req: Request, res: Response): Promise<void> {
    const brand = await this.service.updateBrand(req.params.id, req.body);
    sendSuccess(res, brand);
  }

  public async deleteBrand(req: Request, res: Response): Promise<void> {
    await this.service.deleteBrand(req.params.id);
    sendSuccess(res, { message: 'Brand deleted successfully' });
  }
}

export const brandController = new BrandController();
