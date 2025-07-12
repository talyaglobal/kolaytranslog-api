import * as z from "zod";
import { VesselType } from '@types';

export const getApplicationsSchema = z.object({
  // Pagination
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  
  // Filters
  vesselType: z.nativeEnum(VesselType).optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  captainNationality: z.string().optional(),
  departurePort: z.string().optional(),
  arrivalPort: z.string().optional(),
  purposeKeyword: z.string().optional(),
  vesselName: z.string().optional(),
  
  // Date range filters
  departureDateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  departureDateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  arrivalDateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  arrivalDateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  createdDateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  createdDateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  
  // Sorting
  sortBy: z.enum(['created_at', 'departure_date', 'arrival_date', 'vessel_name', 'captain_name']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
}).refine(
  (data) => {
    if (data.departureDateFrom && data.departureDateTo) {
      return new Date(data.departureDateFrom) <= new Date(data.departureDateTo);
    }
    return true;
  },
  {
    message: "departureDateFrom must be before or equal to departureDateTo",
    path: ["departureDateTo"],
  }
).refine(
  (data) => {
    if (data.arrivalDateFrom && data.arrivalDateTo) {
      return new Date(data.arrivalDateFrom) <= new Date(data.arrivalDateTo);
    }
    return true;
  },
  {
    message: "arrivalDateFrom must be before or equal to arrivalDateTo",
    path: ["arrivalDateTo"],
  }
).refine(
  (data) => {
    if (data.createdDateFrom && data.createdDateTo) {
      return new Date(data.createdDateFrom) <= new Date(data.createdDateTo);
    }
    return true;
  },
  {
    message: "createdDateFrom must be before or equal to createdDateTo",
    path: ["createdDateTo"],
  }
);

export type GetApplicationsDto = z.infer<typeof getApplicationsSchema>;