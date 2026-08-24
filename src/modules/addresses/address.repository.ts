import { prisma } from '../../config/database.js';
import { Address, Prisma } from '@prisma/client';

export class AddressRepository {
  public async findByUserId(userId: string): Promise<Address[]> {
    return prisma.address.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' },
    });
  }

  public async findById(id: string): Promise<Address | null> {
    return prisma.address.findUnique({
      where: { id },
    });
  }

  public async create(data: Prisma.AddressCreateInput): Promise<Address> {
    return prisma.address.create({
      data,
    });
  }

  public async update(id: string, data: Prisma.AddressUpdateInput): Promise<Address> {
    return prisma.address.update({
      where: { id },
      data,
    });
  }

  public async delete(id: string): Promise<Address> {
    return prisma.address.delete({
      where: { id },
    });
  }

  public async resetDefaultAddresses(userId: string): Promise<Prisma.BatchPayload> {
    return prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }
}

export const addressRepository = new AddressRepository();
