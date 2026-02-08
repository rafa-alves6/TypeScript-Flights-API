import { PrismaClient, SysUser } from '@prisma/client';
import { BaseRepository } from './BaseRepository';

export class UserRepository extends BaseRepository<SysUser> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'sysUser');
  }

  async findByUsername(username: string): Promise<SysUser | null> {
    return this.prisma.sysUser.findUnique({
      where: { username },
    });
  }

  async create(data: Omit<SysUser, 'id'>): Promise<SysUser> {
    return this.prisma.sysUser.create({ data });
  }

  async update(id: number, data: Partial<SysUser>): Promise<SysUser> {
    return this.prisma.sysUser.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<void> {
    await this.prisma.sysUser.delete({ where: { id } });
  }
}
