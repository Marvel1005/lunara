import { describe, it, expect } from 'vitest';
import { safeRedirectPath } from '@/lib/auth/redirect';

describe('safeRedirectPath', () => {
  it('passes same-origin relative paths', () => {
    expect(safeRedirectPath('/dashboard')).toBe('/dashboard');
    expect(safeRedirectPath('/calendar?month=2026-10')).toBe('/calendar?month=2026-10');
    expect(safeRedirectPath('/partner/accept?token=abc')).toBe('/partner/accept?token=abc');
  });

  it('uses the fallback for null/undefined/empty', () => {
    expect(safeRedirectPath(null)).toBe('/dashboard');
    expect(safeRedirectPath(undefined)).toBe('/dashboard');
    expect(safeRedirectPath('')).toBe('/dashboard');
    expect(safeRedirectPath('   ')).toBe('/dashboard');
  });

  it('supports a custom fallback', () => {
    expect(safeRedirectPath(null, '/login')).toBe('/login');
  });

  it('rejects absolute URLs', () => {
    expect(safeRedirectPath('https://evil.com')).toBe('/dashboard');
    expect(safeRedirectPath('http://evil.com/path')).toBe('/dashboard');
  });

  it('rejects protocol-relative and backslash variants', () => {
    expect(safeRedirectPath('//evil.com')).toBe('/dashboard');
    expect(safeRedirectPath('/\\evil.com')).toBe('/dashboard');
    expect(safeRedirectPath('\\/evil.com')).toBe('/dashboard');
    expect(safeRedirectPath('//evil.com/%2f..')).toBe('/dashboard');
  });

  it('rejects javascript: and other schemes not starting with /', () => {
    expect(safeRedirectPath('javascript:alert(1)')).toBe('/dashboard');
    expect(safeRedirectPath('data:text/html,<script>')).toBe('/dashboard');
  });

  it('rejects control characters', () => {
    expect(safeRedirectPath('/dash\u0000board')).toBe('/dashboard');
    expect(safeRedirectPath('/dash\nboard')).toBe('/dashboard');
    expect(safeRedirectPath('/dash\u007Fboard')).toBe('/dashboard');
  });

  it('trims surrounding whitespace', () => {
    expect(safeRedirectPath('  /dashboard  ')).toBe('/dashboard');
  });
});
