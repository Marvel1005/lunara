/**
 * Client IP for rate limiting. Returns 'unknown' when unavailable —
 * rate-limit functions treat 'unknown' as a shared bucket, so this
 * never grants unlimited access.
 */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return request.headers.get('x-real-ip')?.trim() || 'unknown';
}
