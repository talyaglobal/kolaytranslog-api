import {Request, Response, NextFunction} from "express";
import { AppError } from "@core/AppError"
import { HttpStatusCode } from '@core/HttpStatus';

export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
	const message = `Route ${req.originalUrl} not found`;

	next(new AppError(message, HttpStatusCode.NOT_FOUND));
}