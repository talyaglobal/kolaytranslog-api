import { Router, RequestHandler } from 'express';
import { container } from 'tsyringe';
import { ApplicationController } from '@api/controllers/application.controller';
import { validate } from '@api/middlewares/validation';
import { newApplicationSchema } from '@dtos/new-application.dto';
import * as z from 'zod';
import asyncHandler from 'express-async-handler';
import { CountriesController } from '@api/controllers/countries.controller';

const router = Router();

// Get controller instance from DI container
const countriesController: CountriesController = container.resolve('CountriesController');

router.get(
  '/',
  asyncHandler(countriesController.getAll.bind(countriesController))
);

export default router;