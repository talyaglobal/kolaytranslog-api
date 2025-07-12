import { Application } from 'express';
import applicationsRouter from './applications.routes';
import countriesRouter from './countries.routes';
import stripeWebhookRouter from './stripe-webhook.routes';

export function registerRoutes(app: Application): void {
	// Mount the routes
	app.use('/applications', applicationsRouter);
	app.use('/countries', countriesRouter);
	app.use('/webhooks/stripe', stripeWebhookRouter);
}