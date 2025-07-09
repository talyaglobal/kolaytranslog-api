import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'tsyringe';
import { ApplicationService } from '@services/application.service';
import { SupabaseService } from '@services/supabase.service';
import { ApiResponse } from '@core/ApiResponse';
import { HttpStatusCode } from '@core/HttpStatus';
import { AppError } from '@core/AppError';
import type { NewApplicationDto } from '@dtos/new-application.dto';
import type { applications } from '@prisma/client';

@injectable()
export class ApplicationController {
  constructor(
    @inject(ApplicationService)
    private readonly applicationService: ApplicationService,
    @inject(SupabaseService)
    private readonly supabaseService: SupabaseService
  ) {}

  /**
   * @route   POST /applications
   * @desc    Create a new application
   * @access  Public
   */
  public create = async (
    req: Request<{}, {}, NewApplicationDto>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const applicationData = req.body;

      // Upload required documents to Supabase
      const uploadPromises = [
        this.uploadFile(applicationData.captainPassportScan, 'captain-passport'),
        this.uploadFile(applicationData.insurancePolicy, 'insurance-policy'),
        this.uploadFile(applicationData.vesselRegistration, 'vessel-registration')
      ];

      const [captainPassportResult, insurancePolicyResult, vesselRegistrationResult] = 
        await Promise.all(uploadPromises);

      // Upload passenger passport scans if any
      let passengersWithUploads: any[] = [];
      if (applicationData.passengers && applicationData.passengers.length > 0) {
        passengersWithUploads = await Promise.all(
          applicationData.passengers.map(async (passenger) => {
            if (passenger.passportScan) {
              const passportScanResult = await this.uploadFile(
                passenger.passportScan,
                'passenger-passport'
              );
              return {
                ...passenger,
                passportScanFilename: passportScanResult.filename,
                passportScanUrl: passportScanResult.url,
                passportScanUploadedAt: passportScanResult.uploadedAt
              };
            }
            return passenger;
          })
        );
      }

      // Create application data with uploaded file URLs
      const applicationWithUploads = {
        ...applicationData,
        captainPassportScan: captainPassportResult,
        insurancePolicy: insurancePolicyResult,
        vesselRegistration: vesselRegistrationResult,
        passengers: passengersWithUploads
      };

      const newApplication = await this.applicationService.createApplication(
        applicationWithUploads
      );

      const response: ApiResponse<applications> = {
        status: 'success',
        statusCode: HttpStatusCode.CREATED,
        message: 'Application created successfully.',
        data: newApplication,
      };

      res.status(response.statusCode).json(response);
    } catch (error) {
      // Pass error to the global error handler
      next(error);
    }
  };

  private async uploadFile(fileUpload: any, folder: string) {
    if (!fileUpload || !fileUpload.data) {
      throw new AppError('File data is required', HttpStatusCode.BAD_REQUEST);
    }

    try {
      // Convert base64 to buffer
      const buffer = Buffer.from(fileUpload.data, 'base64');
      
      return await this.supabaseService.uploadFile(
        buffer,
        fileUpload.filename,
        fileUpload.mimetype,
        folder
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new AppError(
        `Failed to upload ${folder}: ${errorMessage}`,
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}

