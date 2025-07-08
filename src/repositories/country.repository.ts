import { Prisma, countries } from '@prisma/client';
import { BaseRepository } from './base.repository';
import prisma from '../database/data-source';
import { injectable } from 'tsyringe';

@injectable()
export class CountryRepository extends BaseRepository<
  countries,
  Prisma.countriesCreateInput,
  Prisma.countriesUpdateInput
> {
  constructor() {
    super(prisma.countries);
  }
}
