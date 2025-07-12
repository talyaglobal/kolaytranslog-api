import { Router, RequestHandler } from 'express';
import { container } from 'tsyringe';
import { ApplicationController } from '@api/controllers/application.controller';
import { validate } from '@api/middlewares/validation';
import { newApplicationSchema } from '@dtos/new-application.dto';
import { getApplicationsSchema } from '@dtos/get-applications.dto';
import * as z from 'zod';
import asyncHandler from 'express-async-handler';

const router = Router();

// Get controller instance from DI container
const applicationController: ApplicationController = container.resolve(ApplicationController);

// Create validation schemas
const createApplicationValidation = z.object({
  body: newApplicationSchema,
});

const getApplicationsValidation = z.object({
  query: getApplicationsSchema,
});

router.get(
  '/',
  validate(getApplicationsValidation),
  asyncHandler(applicationController.getAll.bind(applicationController))
);

router.post(
  '/',
  validate(createApplicationValidation),
  asyncHandler(applicationController.create.bind(applicationController))
);

router.get(
  '/:id',
  asyncHandler(applicationController.getById.bind(applicationController))
);

export default router;