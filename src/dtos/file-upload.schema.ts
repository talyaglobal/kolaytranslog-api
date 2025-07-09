import * as z from 'zod';

export const fileUploadSchema = z.object({
  filename: z.string().min(1, "Dosya adı gereklidir"),
  mimetype: z.enum(["application/pdf", "image/jpeg", "image/jpg", "image/png"], {
    errorMap: () => ({ message: "Dosya PDF veya JPEG formatında olmalıdır" }),
  }),
  size: z.number().max(10 * 1024 * 1024, "Dosya boyutu en fazla 10MB olabilir"),
  data: z.string().min(1, "Dosya verisi gereklidir"), // Base64 encoded file data
})
