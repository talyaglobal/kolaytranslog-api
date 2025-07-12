import { inject, injectable } from 'tsyringe';
import Stripe from 'stripe';
import { AppError } from '@core/AppError';
import { HttpStatusCode } from '@core/HttpStatus';
import logger from '@utils/logger';
import { config } from '@config';

@injectable()
export class StripeWebhookService {
  private stripe: Stripe;

  constructor() {
    const stripeSecretKey = config.get('stripe.secretKey');
    if (!stripeSecretKey) {
      throw new AppError(
        'Stripe secret key is not configured',
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
    this.stripe = new Stripe(stripeSecretKey);
  }

  public async handleWebhook(
    payload: string | Buffer,
    signature: string
  ): Promise<void> {
    const endpointSecret = config.get('stripe.webhookSecret');
    if (!endpointSecret) {
      throw new AppError(
        'Stripe webhook secret is not configured',
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        endpointSecret
      );
    } catch (error) {
      logger.error('Webhook signature verification failed', error);
      throw new AppError(
        'Webhook signature verification failed',
        HttpStatusCode.BAD_REQUEST
      );
    }

    logger.info('Stripe webhook received', {
      type: event.type,
      id: event.id,
    });

    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event);
          break;
        default:
          logger.warn('Unhandled webhook event type', { type: event.type });
      }
    } catch (error) {
      logger.error('Error processing webhook event', {
        eventType: event.type,
        eventId: event.id,
        error,
      });
      throw new AppError(
        'Error processing webhook event',
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  private async handlePaymentIntentSucceeded(event: Stripe.Event): Promise<void> {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    logger.info('Payment intent succeeded', {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    });
    
    // TODO: Update application status, send confirmation email, etc.
  }

  private async handlePaymentIntentFailed(event: Stripe.Event): Promise<void> {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    logger.info('Payment intent failed', {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    });
    
    // TODO: Update application status, send failure notification, etc.
  }

}