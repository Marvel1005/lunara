// Cookie used to carry the post-auth destination from the magic-link request
// to the auth callback. Kept out of the emailRedirectTo URL so Supabase
// redirect-allowlist matching only ever sees a clean callback URL.
export const AUTH_NEXT_COOKIE = 'lunara_magic_next';