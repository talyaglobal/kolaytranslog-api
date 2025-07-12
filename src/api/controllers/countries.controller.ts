import { CountriesService } from '@services/countries.service';
import { injectable, inject } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { countries } from '@prisma/client';
import { ApiResponse } from '@core/ApiResponse';

@injectable()
export class CountriesController {
	constructor(
		@inject('CountriesService')
		private readonly countriesService: CountriesService,
	) {}

	public async getAll(req: Request, res: Response, next: NextFunction) {
		const countries: countries[] = await this.countriesService.getAllCountries();

		const body: ApiResponse<countries[]> = {
			status: 'success',
			statusCode: 200,
			data: countries,
		}

		res.send(body);
	}
}