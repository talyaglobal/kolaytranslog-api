import { Prisma, payment_disputes } from '@prisma/client';
import { BaseRepository } from './base.repository';
import prisma from '../database/data-source';
import { injectable } from 'tsyringe';

@injectable()
export class PaymentDisputeRepository extends BaseRepository<
  payment_disputes,
  Prisma.payment_disputesCreateInput,
  Prisma.payment_disputesUpdateInput
> {
  constructor() {
    super(prisma.payment_disputes);
  }
}
