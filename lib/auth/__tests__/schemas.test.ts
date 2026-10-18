import { describe, it, expect } from 'vitest';
import { OtpVerifySchema, OtpRequestSchema, OTP_LENGTH } from '@/lib/auth/schemas';

describe('OtpVerifySchema', () => {
  it('accepts a valid email + 8-digit code', () => {
    const result = OtpVerifySchema.safeParse({
      email: 'user@example.com',
      token: '12345678',
    });
    expect(result.success).toBe(true);
  });

  it('trims email whitespace', () => {
    const result = OtpVerifySchema.safeParse({
      email: '  user@example.com  ',
      token: '87654321',
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe('user@example.com');
  });

  it('rejects codes that are not exactly 8 digits', () => {
    for (const token of ['1234567', '123456789', 'abcdefgh', '', '1234 5678']) {
      const result = OtpVerifySchema.safeParse({
        email: 'user@example.com',
        token,
      });
      expect(result.success, `token "${token}" should fail`).toBe(false);
    }
  });

  it('rejects invalid emails', () => {
    for (const email of ['', 'not-an-email', 'a@b', 'x'.repeat(250) + '@e.com']) {
      const result = OtpVerifySchema.safeParse({ email, token: '12345678' });
      expect(result.success, `email "${email}" should fail`).toBe(false);
    }
  });

  it('OTP_LENGTH is 8', () => {
    expect(OTP_LENGTH).toBe(8);
  });
});

describe('OtpRequestSchema', () => {
  it('accepts email alone', () => {
    expect(OtpRequestSchema.safeParse({ email: 'user@example.com' }).success).toBe(true);
  });

  it('accepts email with optional name', () => {
    const result = OtpRequestSchema.safeParse({
      email: 'user@example.com',
      name: 'Priya',
    });
    expect(result.success).toBe(true);
  });

  it('rejects names shorter than 2 chars when provided', () => {
    expect(
      OtpRequestSchema.safeParse({ email: 'user@example.com', name: 'P' }).success
    ).toBe(false);
  });

  it('rejects invalid emails', () => {
    expect(OtpRequestSchema.safeParse({ email: 'nope' }).success).toBe(false);
  });
});
