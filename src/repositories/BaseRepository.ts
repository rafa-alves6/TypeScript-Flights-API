import { PrismaClient } from '@prisma/client';

export abstract class BaseRepository<T> {
  protected prisma: PrismaClient;
  protected model: any;

  constructor(prisma: PrismaClient, modelName: keyof PrismaClient) {
    this.prisma = prisma;
    this.model = prisma[modelName];
  }

  async findAll(): Promise<T[]> {
    return this.model.findMany();
  }

  async findById(id: number, idField: string = 'id'): Promise<T | null> {
    return this.model.findUnique({
      where: { [idField]: id },
    });
  }

}
