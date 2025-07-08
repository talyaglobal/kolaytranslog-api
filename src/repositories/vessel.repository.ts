import { Prisma, vessels } from '@prisma/client';
import { BaseRepository } from './base.repository';
import prisma from '../database/data-source';
import { injectable } from 'tsyringe';

@injectable()
export class VesselRepository extends BaseRepository<
  vessels,
  Prisma.vesselsCreateInput,
  Prisma.vesselsUpdateInput
> {
  constructor() {
    super(prisma.vessels);
  }
}
