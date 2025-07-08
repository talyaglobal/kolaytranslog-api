import HttpStatusCode from './HttpStatus';

export interface ApiResponse<T = null> {
	status: "success" | "error";
	data?: T;
	message?: string;
	statusCode: HttpStatusCode;
}