import { Request, Response } from 'express';
import { addressService, AddressService } from './address.service.js';
import { sendCreated, sendSuccess } from '../../common/utils/response.js';
import { UnauthorizedError } from '../../common/errors/app-error.js';

export class AddressController {
  constructor(private readonly service: ProductService = productService) { }

  public async getAddresses(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const addresses = await this.service.getAddresses(req.user.id);
    sendSuccess(res, addresses);
  }

  public async getAddressById(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const address = await this.service.getAddressById(req.params.id, req.user.id);
    sendSuccess(res, address);
  }

  public async createAddress(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const address = await this.service.createAddress(req.user.id, req.body);
    sendCreated(res, address);
  }

  public async updateAddress(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const address = await this.service.updateAddress(req.params.id, req.user.id, req.body);
    sendSuccess(res, address);
  }

  public async deleteAddress(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    await this.service.deleteAddress(req.params.id, req.user.id);
    sendSuccess(res, { message: 'Address deleted successfully' });
  }
}

export const addressController = new AddressController();
