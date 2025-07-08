import { Prisma, applications } from '@prisma/client';
import { BaseRepository } from './base.repository';
import prisma from '../database/data-source';
import { injectable } from 'tsyringe';

@injectable()
export class ApplicationRepository extends BaseRepository<
  applications,
  Prisma.applicationsCreateInput,
  Prisma.applicationsUpdateInput
> {
  constructor() {
    super(prisma.applications);
  }
}
