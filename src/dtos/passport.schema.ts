import * as z from 'zod';

export const passportSchema = z
  .string()
  .min(6, "Pasaport numarası en az 6 karakter olmalıdır")
  .max(20, "Pasaport numarası en fazla 20 karakter olabilir")
  .regex(/^[A-Z0-9]+$/, "Pasaport numarası sadece büyük harf ve rakam içerebilir")
