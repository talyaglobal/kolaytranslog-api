import * as z from 'zod';

export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Tarih YYYY-MM-DD formatında olmalıdır")
  .refine((date) => {
    const parsed = new Date(date)
    return !isNaN(parsed.getTime()) && parsed >= new Date("1900-01-01")
  }, "Geçerli bir tarih giriniz")
