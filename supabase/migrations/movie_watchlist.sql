-- ============================================================================
-- MOVIE WATCHLIST MIGRATION (P1-2: localStorage -> Supabase)
-- Syncs saved comfort movies across devices like every other user table.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.movie_watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_movie_watchlist_user_movie UNIQUE (user_id, movie_id)
);

CREATE INDEX IF NOT EXISTS idx_movie_watchlist_user_id
ON public.movie_watchlist(user_id);

ALTER TABLE public.movie_watchlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own movie_watchlist" ON public.movie_watchlist;
CREATE POLICY "Users can manage own movie_watchlist"
ON public.movie_watchlist FOR ALL
USING ((SELECT auth.uid()) = user_id);
