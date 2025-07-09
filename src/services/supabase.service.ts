import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { injectable } from 'tsyringe';
import { AppError } from '@core/AppError';
import { HttpStatusCode } from '@core/HttpStatus';
import logger from '@utils/logger';

export interface FileUploadResult {
  filename: string;
  url: string;
  uploadedAt: Date;
}

@injectable()
export class SupabaseService {
  private supabase: SupabaseClient;
  private bucketName: string;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    this.bucketName = process.env.SUPABASE_STORAGE_BUCKET || "uploads";

    if (!supabaseUrl || !supabaseKey) {
      throw new AppError(
        'Supabase configuration is missing',
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async uploadFile(
    buffer: Buffer,
    filename: string,
    mimetype: string,
    folder: string = 'documents'
  ): Promise<FileUploadResult> {
    try {
      const fileExtension = this.getFileExtension(mimetype);
      const timestamp = Date.now();
      const uniqueFilename = `${folder}/${timestamp}-${filename}${fileExtension}`;

      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(uniqueFilename, buffer, {
          contentType: mimetype,
          upsert: false
        });

      if (error) {
        logger.error('Supabase upload error:', error);
        throw new AppError(
          `File upload failed: ${error.message}`,
          HttpStatusCode.INTERNAL_SERVER_ERROR
        );
      }

      const { data: publicUrlData } = this.supabase.storage
        .from(this.bucketName)
        .getPublicUrl(uniqueFilename);

      return {
        filename: uniqueFilename,
        url: publicUrlData.publicUrl,
        uploadedAt: new Date()
      };
    } catch (error) {
      logger.error('File upload error:', error);
      throw new AppError(
        'File upload failed',
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async deleteFile(filename: string): Promise<void> {
    try {
      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .remove([filename]);

      if (error) {
        logger.error('Supabase delete error:', error);
        throw new AppError(
          `File deletion failed: ${error.message}`,
          HttpStatusCode.INTERNAL_SERVER_ERROR
        );
      }
    } catch (error) {
      logger.error('File deletion error:', error);
      throw new AppError(
        'File deletion failed',
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  private getFileExtension(mimetype: string): string {
    const extensions: { [key: string]: string } = {
      'application/pdf': '.pdf',
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png'
    };
    return extensions[mimetype] || '';
  }
}