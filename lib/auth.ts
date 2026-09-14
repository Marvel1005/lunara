// Cookie used to carry the post-auth destination from the magic-link request
// to the auth callback. Kept out of the emailRedirectTo URL so Supabase
// redirect-allowlist matching only ever sees a clean callback URL.
export const AUTH_NEXT_COOKIE = 'lunara_magic_next';

// Maps callback error codes to friendly messages shown on the auth pages.
// Lives here (not in a 'use client' component file) so both server components
// and client components can import it.
export function magicLinkErrorMessage(code: string | null): string | null {
  if (code === 'magic_link_invalid')
    return 'That sign-in link is invalid or has expired. Please request a new one to continue.';
  if (code)
    return "We couldn't complete that sign-in. Please try again.";
  return null;
}