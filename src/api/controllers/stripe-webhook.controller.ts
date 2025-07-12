import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'tsyringe';
import { StripeWebhookService } from '@services/stripe-webhook.service';
import { ApiResponse } from '@core/ApiResponse';
import { HttpStatusCode } from '@core/HttpStatus';
import { AppError } from '@core/AppError';
import logger from '@utils/logger';

@injectable()
export class StripeWebhookController {
  constructor(
    @inject(StripeWebhookService)
    private readonly stripeWebhookService: StripeWebhookService
  ) {}

  public async handleWebhook(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const signature = req.headers['stripe-signature'];
      
      if (!signature) {
        throw new AppError(
          'Missing Stripe signature header',
          HttpStatusCode.BAD_REQUEST
        );
      }

      if (typeof signature !== 'string') {
        throw new AppError(
          'Invalid Stripe signature header',
          HttpStatusCode.BAD_REQUEST
        );
      }

      //raw body
      const payload = req.body;
      
      if (!payload) {
        throw new AppError(
          'Missing webhook payload',
          HttpStatusCode.BAD_REQUEST
        );
      }

      await this.stripeWebhookService.handleWebhook(payload, signature);

      const response: ApiResponse<null> = {
        status: 'success',
        statusCode: HttpStatusCode.OK,
        message: 'Webhook processed successfully',
        data: null,
      };

      res.status(response.statusCode).json(response);
    } catch (error) {
      logger.error('Webhook processing failed', error);
      next(error);
    }
  }
}