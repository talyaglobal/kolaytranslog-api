import HttpStatusCode from './HttpStatus';

export class AppError extends Error {
	public readonly statusCode: number;
	public readonly isOperational = true;

	constructor(message: string, statusCode: HttpStatusCode = 500) {
		super(message);
		this.statusCode = statusCode;
		Error.captureStackTrace(this, this.constructor);
	} 
}