import { inject, injectable } from 'tsyringe';
import { CountryRepository } from '@repositories/country.repository';
import { AppError } from '@core/AppError';
import { HttpStatusCode } from '@core/HttpStatus';
import logger from '@utils/logger';
import type { countries } from '@prisma/client';

@injectable()
export class CountriesService {
  constructor(
    @inject('CountryRepository')
    private readonly countryRepository: CountryRepository
  ) {}

  public async getAllCountries(): Promise<countries[]> {
    try {
      logger.info('Fetching all countries');
      
      const countries = await this.countryRepository.findAll({});
      
      logger.info('Countries fetched successfully', { count: countries.length });
      return countries;
    } catch (error) {
      logger.error('Failed to fetch countries', error);
      throw new AppError(
        'Failed to fetch countries',
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  public async getCountryById(id: string): Promise<countries | null> {
    try {
      logger.info('Fetching country by ID', { id });
      
      const country = await this.countryRepository.findById(id);
      
      if (!country) {
        logger.warn('Country not found', { id });
        return null;
      }
      
      logger.info('Country fetched successfully', { id, name: country.name });
      return country;
    } catch (error) {
      logger.error('Failed to fetch country', { id, error });
      throw new AppError(
        'Failed to fetch country',
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  public async getCountryByCode(code: string): Promise<countries | null> {
    try {
      logger.info('Fetching country by code', { code });
      
      const country = await this.countryRepository.findFirst({
        where: { code: code.toUpperCase() }
      });
      
      if (!country) {
        logger.warn('Country not found', { code });
        return null;
      }
      
      logger.info('Country fetched successfully', { code, name: country.name });
      return country;
    } catch (error) {
      logger.error('Failed to fetch country by code', { code, error });
      throw new AppError(
        'Failed to fetch country',
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}