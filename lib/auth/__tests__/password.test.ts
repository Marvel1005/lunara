import { describe, it, expect } from 'vitest';
import { validatePassword, passwordStrength } from '@/lib/auth/password';

describe('validatePassword', () => {
  it('accepts a strong password', () => {
    expect(validatePassword('Moonlight!42')).toBeNull();
    expect(validatePassword('Velvet-Rain-88x')).toBeNull();
  });

  it('rejects short passwords', () => {
    expect(validatePassword('Ab1!xy')).toBe(
      'Password must be at least 8 characters.'
    );
  });

  it('rejects missing character classes', () => {
    expect(validatePassword('alllowercase1!')).toContain('uppercase');
    expect(validatePassword('ALLUPPERCASE1!')).toContain('lowercase');
    expect(validatePassword('NoDigitsHere!')).toContain('number');
    expect(validatePassword('NoSpecial1Char')).toContain('special character');
  });

  it('rejects common passwords and leet variants', () => {
    expect(validatePassword('Password123!')).toContain('too common');
    expect(validatePassword('P@ssw0rd!')).toContain('too common');
    expect(validatePassword('Qwerty123!')).toContain('too common');
  });

  it('does not blocklist substrings of strong passwords', () => {
    expect(validatePassword('MyDragonFly99!')).toBeNull();
  });

  it('rejects passwords containing the user email or name', () => {
    expect(
      validatePassword('Ashley2026!x', { email: 'ashley@example.com' })
    ).toContain('name or email');
    expect(
      validatePassword('Brianna99!zz', { name: 'Brianna Doe' })
    ).toContain('name or email');
    expect(
      validatePassword('Ashley2026!x', { email: 'ashley@example.com' })
    ).toContain('name or email');
  });

  it('ignores short name parts (< 4 chars) for personal-info check', () => {
    expect(validatePassword('Moonlight!42', { name: 'Li Go' })).toBeNull();
  });
});

describe('passwordStrength', () => {
  it('scores empty/short as Weak', () => {
    expect(passwordStrength('')).toEqual({ score: 0, label: 'Weak' });
    expect(passwordStrength('Ab1!xy')).toEqual({ score: 0, label: 'Weak' });
  });

  it('scores a mixed long password as Strong or Very Strong', () => {
    const result = passwordStrength('Moonlight!42');
    expect(result.score).toBeGreaterThanOrEqual(3);
    expect(['Strong', 'Very Strong']).toContain(result.label);
  });

  it('caps common passwords at Weak', () => {
    const result = passwordStrength('Password123!');
    expect(result.score).toBeLessThanOrEqual(1);
    expect(result.label).toBe('Weak');
  });
});
