import { Prisma, passengers } from '@prisma/client';
import { BaseRepository } from './base.repository';
import prisma from '../database/data-source';
import { injectable } from 'tsyringe';

@injectable()
export class PassengerRepository extends BaseRepository<
  passengers,
  Prisma.passengersCreateInput,
  Prisma.passengersUpdateInput
> {
  constructor() {
    super(prisma.passengers);
  }
}
