import { addressRepository, AddressRepository } from './address.repository.js';
import { CreateAddressInput, UpdateAddressInput } from './address.schema.js';
import { Address } from '@prisma/client';
import { NotFoundError, ForbiddenError } from '../../common/errors/app-error.js';
import { ErrorCodes } from '../../common/errors/error-codes.js';

export class AddressService {
  constructor(private readonly repo: AddressRepository = addressRepository) {}

  public async getAddresses(userId: string): Promise<Address[]> {
    return this.repo.findByUserId(userId);
  }

  public async getAddressById(id: string, userId: string): Promise<Address> {
    const address = await this.repo.findById(id);
    if (!address) {
      throw new NotFoundError('Address not found', ErrorCodes.NOT_FOUND);
    }
    if (address.userId !== userId) {
      throw new ForbiddenError('Access to this address is forbidden');
    }
    return address;
  }

  public async createAddress(userId: string, input: CreateAddressInput): Promise<Address> {
    if (input.isDefault) {
      await this.repo.resetDefaultAddresses(userId);
    }
    return this.repo.create({
      ...input,
      user: { connect: { id: userId } },
    });
  }

  public async updateAddress(id: string, userId: string, input: UpdateAddressInput): Promise<Address> {
    await this.getAddressById(id, userId);
    if (input.isDefault) {
      await this.repo.resetDefaultAddresses(userId);
    }
    return this.repo.update(id, input);
  }

  public async deleteAddress(id: string, userId: string): Promise<void> {
    await this.getAddressById(id, userId);
    await this.repo.delete(id);
  }
}

export const addressService = new AddressService();
