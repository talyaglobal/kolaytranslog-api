import * as z from "zod"
import { dateSchema, fileUploadSchema, passengerSchema, countrySchema } from '@dtos';
import { VesselType } from '@types';

export const newApplicationSchema = z
  .object({
    vessel: z.string().min(2, "Tekne adı gereklidir"),
    owner: z.string().min(2, "Sahip adı gereklidir"),
    amount: z.number().min(0, "Tutar negatif olamaz"),
    captainNationality: countrySchema,
    captainPassport: z.string().min(2, "Kaptan pasaport numarası gereklidir"),
    purpose: z.string().min(2, "Giriş amacı gereklidir"),
    contactPhone: z.string().min(2, "İletişim numarasıgereklidir"),
    contactEmail: z.string().email().min(2, "İletişim maili gereklidir"),
    details: z.object({
      vesselLength: z.string().min(1, "Tekne uzunluğu gereklidir"),
      entryPort: z.string().min(1, "Giriş limanı gereklidir"),
      exitPort: z.string().min(1, "Çıkış limanı gereklidir"),
      type: z.nativeEnum(VesselType),
      flag: countrySchema,
      registrationNumber: z.string().min(2, "Sicil numarası gereklidir"),
      entryDate: dateSchema,
      exitDate: dateSchema,
    }),
    passengers: z.array(passengerSchema).optional(),
    // Required document uploads
    captainPassportScan: fileUploadSchema,
    insurancePolicy: fileUploadSchema,
    vesselRegistration: fileUploadSchema
  })
  .refine(
    (data) => {
      const entryDate = new Date(data.details.entryDate)
      const exitDate = new Date(data.details.exitDate)
      return exitDate > entryDate
    },
    {
      message: "Çıkış tarihi giriş tarihinden sonra olmalıdır",
      path: ["details", "exitDate"],
    },
  )

export type NewApplicationDto = z.infer<typeof newApplicationSchema>;