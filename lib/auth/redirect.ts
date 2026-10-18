/**
 * Single source of truth for post-auth redirect validation.
 *
 * Only same-origin relative paths are allowed:
 *   pass: /dashboard  /calendar?month=2026-10  /partner/accept?token=abc
 *   fail: https://evil.com  //evil.com  /\evil.com  \\evil.com  javascript:...
 */
const CONTROL_CHARS = new RegExp('[\\u0000-\\u001F\\u007F]');

export function safeRedirectPath(
  raw: string | null | undefined,
  fallback = '/dashboard'
): string {
  if (!raw) return fallback;
  const value = raw.trim();
  // Must be an absolute path (rejects schemes, hostless junk, empty).
  if (!value.startsWith('/')) return fallback;
  // Protocol-relative (//host or /\host or \/host) is an off-site redirect.
  const second = value.charAt(1);
  if (second === '/' || second === '\\') return fallback;
  // Control characters anywhere make the path unsafe to trust.
  if (CONTROL_CHARS.test(value)) return fallback;
  return value;
}
