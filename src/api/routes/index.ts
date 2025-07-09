import { Application } from 'express';
import applicationsRouter from './applications.routes';

export function registerRoutes(app: Application): void {
	// Mount the routes
	app.use('/applications', applicationsRouter);
}