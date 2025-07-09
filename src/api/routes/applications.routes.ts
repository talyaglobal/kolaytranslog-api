import { Router, RequestHandler } from 'express';
import { container } from 'tsyringe';
import { ApplicationController } from '@api/controllers/application.controller';
import { validate } from '@api/middlewares/validation';
import { newApplicationSchema } from '@dtos/new-application.dto';
import * as z from 'zod';

const router = Router();

// Get controller instance from DI container
const applicationController: ApplicationController = container.resolve(ApplicationController);

// Create validation schema for the request body
const createApplicationValidation = z.object({
  body: newApplicationSchema,
});

/**
 * @route   POST /applications
 * @desc    Create a new application
 * @access  Public
 */
router.post(
  '/',
  validate(createApplicationValidation),
  applicationController.create
);

export default router;