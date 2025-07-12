import * as z from "zod"
import { dateSchema, fileUploadSchema, countrySchema } from '@dtos';
import { VesselType } from '@types';

const phoneSchema = z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, "Invalid phone number format").optional();

export const newApplicationSchema = z
  .object({
    // Vessel Information
    vesselName: z.string().min(2, "Vessel name is required"),
    vesselType: z.nativeEnum(VesselType),
    vesselLength: z.number().min(0.1, "Vessel length must be greater than 0"),
    flagCountry: countrySchema,
    vesselRegistrationNumber: z.string().optional(),
    manufacturingYear: z.number().min(1900).max(new Date().getFullYear()).optional(),
    enginePower: z.string().optional(),
    hullMaterial: z.string().optional(),

    // Owner Information
    firstName: z.string().min(2, "First name is required").max(50, "First name too long").regex(/^[A-Za-z\s]+$/, "Only letters allowed"),
    lastName: z.string().min(2, "Last name is required").max(50, "Last name too long").regex(/^[A-Za-z\s]+$/, "Only letters allowed"),
    email: z.string().email("Valid email required"),
    nationality: countrySchema,
    companyName: z.string().optional(),
    passportNumber: z.string().optional(),
    phoneNumber: phoneSchema,
    address: z.string().optional(),

    // Trip Information
    entryPort: z.string().min(1, "Entry port is required"),
    exitPort: z.string().min(1, "Exit port is required"),
    entryDate: dateSchema,
    exitDate: dateSchema,
    tripPurpose: z.string().min(2, "Trip purpose is required"),
    crewCount: z.number().min(0).optional(),
    passengerCount: z.number().min(0).optional(),
    emergencyContact: z.string().optional(),
    specialRequests: z.string().optional(),
    insuranceInformation: z.string().optional(),
    previousVisits: z.boolean().optional(),

    // Documents
    documents: z.array(fileUploadSchema).optional()
  })
  .refine(
    (data) => {
      const entryDate = new Date(data.entryDate)
      const exitDate = new Date(data.exitDate)
      return exitDate > entryDate
    },
    {
      message: "Exit date must be after entry date",
      path: ["exitDate"],
    },
  )
  .refine(
    (data) => {
      const entryDate = new Date(data.entryDate)
      return entryDate > new Date()
    },
    {
      message: "Entry date must be in the future",
      path: ["entryDate"],
    },
  )

export type NewApplicationDto = z.infer<typeof newApplicationSchema>;