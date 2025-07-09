import * as z from 'zod';
import { countrySchema, dateSchema, fileUploadSchema, passportSchema } from '@dtos';

export const passengerSchema = z.object({
  firstName: z
    .string()
    .min(2, "Ad en az 2 karakter olmalıdır")
    .max(50, "Ad en fazla 50 karakter olabilir")
    .regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/, "Ad sadece harf içerebilir"),

  lastName: z
    .string()
    .min(2, "Soyad en az 2 karakter olmalıdır")
    .max(50, "Soyad en fazla 50 karakter olabilir")
    .regex(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s\-']+$/, "Soyad sadece harf içerebilir"),

  nationality: countrySchema,

  passportNumber: passportSchema,

  passportExpiry: dateSchema,

  birthDate: dateSchema.refine((date) => {
    const birthDate = new Date(date)
    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()
    return age >= 0 && age <= 120
  }, "Geçerli bir doğum tarihi giriniz"),

  birthPlace: z
    .string()
    .min(2, "Doğum yeri en az 2 karakter olmalıdır")
    .max(100, "Doğum yeri en fazla 100 karakter olabilir"),

  gender: z.enum(["male", "female"], {
    errorMap: () => ({ message: "Cinsiyet seçiniz" }),
  }),

  passportScan: fileUploadSchema.optional(),
})