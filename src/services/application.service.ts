import { inject, injectable } from 'tsyringe';
import type { NewApplicationDto } from '@dtos/new-application.dto';
import { ApplicationRepository } from '@repositories/application.repository';
import { AppError } from '@core/AppError';
import { HttpStatusCode } from '@core/HttpStatus';
import logger from '@utils/logger';
import type { applications, Prisma } from '@prisma/client';

@injectable()
export class ApplicationService {
  constructor(
    @inject(ApplicationRepository)
    private readonly applicationRepository: ApplicationRepository
  ) {}

  public async createApplication(applicationData: any): Promise<applications> {
    try {
      logger.info('Creating new application', { vessel: applicationData.vessel });
      
      // First, create or find the vessel
      const vesselData = {
        name: applicationData.vessel,
        type: applicationData.details.type,
        length: parseFloat(applicationData.details.vesselLength),
        flag: applicationData.details.flag,
        registration_number: applicationData.details.registrationNumber,
      };

      // Transform DTO to Prisma schema format
      const applicationInput = {
        vessels: {
          connectOrCreate: {
            where: { registration_number: vesselData.registration_number },
            create: vesselData,
          },
        },
        captain_name: applicationData.owner,
        captain_nationality: applicationData.captainNationality,
        captain_passport: applicationData.captainPassport,
        departure_port: applicationData.details.entryPort,
        arrival_port: applicationData.details.exitPort,
        departure_date: new Date(applicationData.details.entryDate),
        arrival_date: new Date(applicationData.details.exitDate),
        crew_count: applicationData.passengers?.length || 0,
        purpose: applicationData.purpose,
        contact_email: applicationData.contactEmail,
        contact_phone: applicationData.contactPhone,
        insurance_policy: applicationData.insurancePolicy.url,
        vessel_registration: applicationData.vesselRegistration.url,
        captain_passport_scan: applicationData.captainPassportScan.url,
        passengers: {
          create: applicationData.passengers?.map((passenger: any) => ({
            name: passenger.firstName,
            surname: passenger.lastName,
            nationality: passenger.nationality,
            passport_number: passenger.passportNumber,
            passport_expiration: passenger.passportExpiry ? new Date(passenger.passportExpiry) : null,
            date_of_birth: passenger.birthDate ? new Date(passenger.birthDate) : null,
            city_of_birth: passenger.birthPlace,
            gender: passenger.gender,
            passport_scan_filename: passenger.passportScanFilename || '',
            passport_scan_url: passenger.passportScanUrl || '',
            passport_scan_uploaded_at: passenger.passportScanUploadedAt ? new Date(passenger.passportScanUploadedAt) : new Date(),
          })) || [],
        },
      };
      
      const newApplication = await this.applicationRepository.create(applicationInput);
      
      logger.info('Application created successfully', { id: newApplication.id });
      return newApplication;
    } catch (error) {
      logger.error('Failed to create application', error);
      throw new AppError(
        'Failed to create application',
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}
