import { Request, Response } from 'express';
import { categoryService, CategoryService } from './category.service.js';
import { sendCreated, sendSuccess } from '../../common/utils/response.js';

export class CategoryController {
  constructor(private readonly service: CategoryService = categoryService) {}

  public async getCategories(req: Request, res: Response): Promise<void> {
    const asTree = req.query.tree === 'true';
    const categories = await this.service.getCategories(asTree);
    sendSuccess(res, categories);
  }

  public async getCategoryById(req: Request, res: Response): Promise<void> {
    const category = await this.service.getCategoryById(req.params.id);
    sendSuccess(res, category);
  }

  public async createCategory(req: Request, res: Response): Promise<void> {
    const category = await this.service.createCategory(req.body);
    sendCreated(res, category);
  }

  public async updateCategory(req: Request, res: Response): Promise<void> {
    const category = await this.service.updateCategory(req.params.id, req.body);
    sendSuccess(res, category);
  }

  public async deleteCategory(req: Request, res: Response): Promise<void> {
    await this.service.deleteCategory(req.params.id);
    sendSuccess(res, { message: 'Category deleted successfully' });
  }
}

export const categoryController = new CategoryController();
