import { z } from 'zod';

export const OTP_LENGTH = 8;

export const OtpVerifySchema = z.object({
  email: z.string().trim().min(3).max(254).email('Invalid email address.'),
  token: z.string().regex(/^\d{8}$/, 'Code must be exactly 8 digits.'),
});

export type OtpVerifyInput = z.infer<typeof OtpVerifySchema>;

export const OtpRequestSchema = z.object({
  email: z.string().trim().min(3).max(254).email('Invalid email address.'),
  name: z.string().trim().min(2).max(60).optional(),
});

export type OtpRequestInput = z.infer<typeof OtpRequestSchema>;
