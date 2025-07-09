import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import logger from '@utils/logger';
import { ApiResponse } from '@core/ApiResponse';
import { HttpStatusCode } from '@core/HttpStatus';

// This is a higher-order function that takes a Zod schema and returns an Express middleware.
export const validate =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        logger.error({ err: error }, 'Zod validation error');

        const errorMessages = error.errors.map((issue) => ({
          message: issue.message,
          path: issue.path.join('.'),
        }));
        
        const response: ApiResponse<any> = {
          status: 'error',
          statusCode: HttpStatusCode.BAD_REQUEST,
          message: 'Invalid input provided.',
          data: { errors: errorMessages },
        };
        res.status(response.statusCode).json(response)
        return ;
      }

      logger.error({ err: error }, 'An unexpected error occurred during validation.');
      next(error);
      return;
    }
  };

