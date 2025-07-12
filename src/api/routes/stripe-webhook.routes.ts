import { Router } from 'express';
import { container } from 'tsyringe';
import { StripeWebhookController } from '@api/controllers/stripe-webhook.controller';
import asyncHandler from 'express-async-handler';
import express from 'express';

const router = Router();

// Get controller instance from DI container
const stripeWebhookController: StripeWebhookController = container.resolve(StripeWebhookController);

// Stripe webhook endpoint with raw body parser
// This is required for webhook signature verification
router.post(
  '/',
  express.raw({ type: 'application/json' }),
  asyncHandler(stripeWebhookController.handleWebhook.bind(stripeWebhookController))
);

export default router;