import { PrismaClient } from '@prisma/client';
import prisma from '../database/data-source';

export class BaseRepository<T, C, U> {
  constructor(private readonly model: any) {}

  async create(data: C): Promise<T> {
    return this.model.create({ data });
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findUnique({ where: { id } });
  }

  async findFirst(params: { where?: any }): Promise<T | null> {
    return this.model.findFirst(params);
  }

  async update(id: string, data: U): Promise<T> {
    return this.model.update({ where: { id }, data });
  }

  async delete(id: string): Promise<T> {
    return this.model.delete({ where: { id } });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: any;
    where?: any;
    orderBy?: any;
  }): Promise<T[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.model.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async count(where?: any): Promise<number> {
    return this.model.count({ where });
  }
}
