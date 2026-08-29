import { productRepository, ProductRepository } from "./product.repository.js";
import { NotFoundError } from "@/common/errors/app-error.js";
import { ErrorCodes } from "@/common/errors/error-codes.js";
import { Prisma } from "@prisma/client";


export class ProductService {
    constructor(private readonly productRepository: ProductRepository = productRepository) { }

    public async createProduct(data: Prisma.ProductCreateInput) {
        return this.productRepository.create(data);
    }

    public async getProductById(id: string) {
        const product = await this.productRepository.findById(id);
        if (!product) {
            throw new NotFoundError('Product not found', ErrorCodes.NOT_FOUND);
        }
        return product;
    }
    public async updateProduct(id: string, data: Prisma.ProductUpdateInput) {
        return this.productRepository.updateById(id, data);
    }
    public async deleteProduct(id: string) {
        return this.productRepository.deleteById(id);
    }
}

export const productService = new ProductService(productRepository);