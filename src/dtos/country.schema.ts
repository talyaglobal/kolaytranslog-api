import * as z from 'zod';

export const countrySchema = z
  .string()
  .min(2, "Ülke adı en az 2 karakter olmalıdır")
  .max(100, "Ülke adı en fazla 100 karakter olabilir")
  .regex(/^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s\-.'()]+$/, "Geçerli bir ülke adı giriniz");