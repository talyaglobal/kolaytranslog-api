import { config } from '@config';
import logger from '@utils/logger';
import { ApiResponse } from 'core/ApiResponse';
import { AppError } from 'core/AppError';
import { Request, Response, NextFunction } from 'express';

export function errorHandler (
	err: Error | AppError,
	req: Request,
	res: Response,
	next: NextFunction
) {
	let statusCode = 400;
	let message = "Internal Server Error"

	if (err instanceof AppError) {
		statusCode = err.statusCode
		message = err.message
	}

	logger.error({
		error: err instanceof Error ? err.stack || err.message : err,
		method: req.method,
		path: req.originalUrl
	}, "Unhandled exception");

	const payload: ApiResponse<string> = {
		status: "error",
		statusCode,
		message,
	};

	if (process.env.NODE_ENV !== 'production' && err instanceof Error) {
    payload.data = err.stack;
  }

  res.status(statusCode).json(payload);
}