import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'tsyringe';
import { ApplicationService } from '@services/application.service';
import { SupabaseService } from '@services/supabase.service';
import { ApiResponse } from '@core/ApiResponse';
import { HttpStatusCode } from '@core/HttpStatus';
import { AppError } from '@core/AppError';
import type { NewApplicationDto } from '@dtos/new-application.dto';
import type { GetApplicationsDto } from '@dtos/get-applications.dto';
import type { applications } from '@prisma/client';

@injectable()
export class ApplicationController {
  constructor(
    @inject(ApplicationService)
    private readonly applicationService: ApplicationService,
    @inject(SupabaseService)
    private readonly supabaseService: SupabaseService
  ) {}

  public async getAll(
    req: Request<{}, {}, {}>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const filters = req.query;
      const result = await this.applicationService.getAllApplications(filters as any);

      const response: ApiResponse<typeof result> = {
        status: 'success',
        statusCode: HttpStatusCode.OK,
        message: 'Applications retrieved successfully.',
        data: result,
      };

      res.status(response.statusCode).json(response);
    } catch (error) {
      next(error);
    }
  }

  public async create(
    req: Request<{}, {}, NewApplicationDto>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const applicationData = req.body;

      // Upload documents to Supabase if provided
      let documentsWithUploads: any[] = [];
      if (applicationData.documents && applicationData.documents.length > 0) {
        documentsWithUploads = await Promise.all(
          applicationData.documents.map(async (document: any) => {
            try {
              const uploadResult = await this.uploadFile(document, 'application-documents');
              return {
                url: uploadResult.url,
                filename: uploadResult.filename,
                originalFilename: document.filename,
                mimetype: document.mimetype,
                size: document.size,
                uploadedAt: uploadResult.uploadedAt
              };
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              throw new AppError(
                `Failed to upload document ${document.filename}: ${errorMessage}`,
                HttpStatusCode.BAD_REQUEST
              );
            }
          })
        );
      }

      // Create application data with uploaded document URLs
      const applicationWithUploads = {
        ...applicationData,
        documents: documentsWithUploads
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
  }

  public async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;

    const application = await this.applicationService.getById(id);

    if (!application) {
      next(new AppError("Application not found", HttpStatusCode.NOT_FOUND));
      return;
    }

    const body: ApiResponse<applications> = {
      status: 'success', 
      statusCode: HttpStatusCode.OK, 
      data: application,
    }

    res.send(body);
    return;
  }

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

