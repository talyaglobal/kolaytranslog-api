import { inject, injectable } from 'tsyringe';
import type { NewApplicationDto } from '@dtos/new-application.dto';
import type { GetApplicationsDto } from '@dtos/get-applications.dto';
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
      logger.info('Creating new application', { vessel: applicationData.vesselName });
      
      // First, create or find the vessel
      const vesselData = {
        name: applicationData.vesselName,
        type: applicationData.vesselType,
        length: applicationData.vesselLength,
        flag: applicationData.flagCountry,
        registration_number: applicationData.vesselRegistrationNumber || '',
        manufacturing_year: applicationData.manufacturingYear,
        engine_power: applicationData.enginePower,
        hull_material: applicationData.hullMaterial,
      };

      // Extract document URLs from uploaded documents
      const documentUrls: string[] = [];
      if (applicationData.documents && applicationData.documents.length > 0) {
        applicationData.documents.forEach((doc: any) => {
          if (doc.url) {
            documentUrls.push(doc.url);
          }
        });
      }

      // Transform DTO to Prisma schema format
      const applicationInput = {
        vessels: {
          connectOrCreate: {
            where: { 
              registration_number: vesselData.registration_number || `${applicationData.vesselName}-${Date.now()}`
            },
            create: vesselData,
          },
        },
        captain_name: `${applicationData.firstName} ${applicationData.lastName}`,
        captain_nationality: applicationData.nationality,
        captain_passport: applicationData.passportNumber || '',
        departure_port: applicationData.entryPort,
        arrival_port: applicationData.exitPort,
        departure_date: new Date(applicationData.entryDate),
        arrival_date: new Date(applicationData.exitDate),
        crew_count: applicationData.crewCount || 0,
        passenger_count: applicationData.passengerCount || 0,
        purpose: applicationData.tripPurpose,
        contact_email: applicationData.email,
        contact_phone: applicationData.phoneNumber || '',
        company_name: applicationData.companyName,
        address: applicationData.address,
        emergency_contact: applicationData.emergencyContact,
        special_requests: applicationData.specialRequests,
        insurance_information: applicationData.insuranceInformation,
        previous_visits: applicationData.previousVisits || false,
        document_urls: documentUrls,
      };
      
      logger.info('Application input prepared', { applicationInput });
      
      const newApplication = await this.applicationRepository.create(applicationInput);
      
      logger.info('Application created successfully', { id: newApplication.id });
      return newApplication;
    } catch (error) {
      logger.error('Failed to create application', { error: error instanceof Error ? error.message : error, stack: error instanceof Error ? error.stack : undefined });
      throw new AppError(
        'Failed to create application',
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  public async getById(id: string) {
    return await this.applicationRepository.findById(id);
  }

  public async getAllApplications(filters: GetApplicationsDto) {
    try {
      const { page, limit, sortBy, sortOrder, ...searchFilters } = filters;
      
      // Calculate pagination
      const skip = (page - 1) * limit || 0;
      
      // Build where clause for filtering
      const where: Prisma.applicationsWhereInput = {};
      
      // Status filter
      if (searchFilters.status) {
        where.status = searchFilters.status;
      }
      
      // Captain nationality filter
      if (searchFilters.captainNationality) {
        where.captain_nationality = {
          contains: searchFilters.captainNationality,
          mode: 'insensitive',
        };
      }
      
      // Port filters
      if (searchFilters.departurePort) {
        where.departure_port = {
          contains: searchFilters.departurePort,
          mode: 'insensitive',
        };
      }
      
      if (searchFilters.arrivalPort) {
        where.arrival_port = {
          contains: searchFilters.arrivalPort,
          mode: 'insensitive',
        };
      }
      
      // Purpose keyword filter
      if (searchFilters.purposeKeyword) {
        where.purpose = {
          contains: searchFilters.purposeKeyword,
          mode: 'insensitive',
        };
      }
      
      // Date range filters
      if (searchFilters.departureDateFrom || searchFilters.departureDateTo) {
        where.departure_date = {};
        if (searchFilters.departureDateFrom) {
          where.departure_date.gte = new Date(searchFilters.departureDateFrom);
        }
        if (searchFilters.departureDateTo) {
          where.departure_date.lte = new Date(searchFilters.departureDateTo);
        }
      }
      
      if (searchFilters.arrivalDateFrom || searchFilters.arrivalDateTo) {
        where.arrival_date = {};
        if (searchFilters.arrivalDateFrom) {
          where.arrival_date.gte = new Date(searchFilters.arrivalDateFrom);
        }
        if (searchFilters.arrivalDateTo) {
          where.arrival_date.lte = new Date(searchFilters.arrivalDateTo);
        }
      }
      
      if (searchFilters.createdDateFrom || searchFilters.createdDateTo) {
        where.created_at = {};
        if (searchFilters.createdDateFrom) {
          where.created_at.gte = new Date(searchFilters.createdDateFrom);
        }
        if (searchFilters.createdDateTo) {
          where.created_at.lte = new Date(searchFilters.createdDateTo);
        }
      }
      
      // Vessel filters (requires joining with vessels table)
      if (searchFilters.vesselType || searchFilters.vesselName) {
        where.vessels = {};
        
        if (searchFilters.vesselType) {
          where.vessels.type = searchFilters.vesselType;
        }
        
        if (searchFilters.vesselName) {
          where.vessels.name = {
            contains: searchFilters.vesselName,
            mode: 'insensitive',
          };
        }
      }
      
      // Build orderBy clause
      const orderBy: Prisma.applicationsOrderByWithRelationInput = {};
      
      switch (sortBy) {
        case 'vessel_name':
          orderBy.vessels = { name: sortOrder };
          break;
        case 'captain_name':
          orderBy.captain_name = sortOrder;
          break;
        case 'created_at':
          orderBy.created_at = sortOrder;
          break;
        case 'departure_date':
          orderBy.departure_date = sortOrder;
          break;
        case 'arrival_date':
          orderBy.arrival_date = sortOrder;
          break;
        default:
          orderBy.created_at = sortOrder;
      }
      
      // Build query parameters
      const queryParams: any = {
        skip,
        take: limit,
        where,
        orderBy,
      };
      
      // Include vessels if we're filtering by vessel properties or sorting by vessel fields
      if (searchFilters.vesselType || searchFilters.vesselName || sortBy === 'vessel_name') {
        queryParams.include = { vessels: true };
      }
      
      // Get applications with pagination and filtering
      const applications = await this.applicationRepository.findAll(queryParams);
      
      // Get total count for pagination info
      const totalCount = await this.applicationRepository.count(where);
      
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;
      
      logger.info('Retrieved applications with filters', {
        count: applications.length,
        totalCount,
        page,
        limit,
        filters: searchFilters,
      });
      
      return {
        data: applications,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage,
          hasPreviousPage,
        },
      };
    } catch (error) {
      logger.error('Failed to retrieve applications', error);
      throw new AppError(
        'Failed to retrieve applications',
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}
