import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export function useWatchlist() {
  const queryClient = useQueryClient();

  const query = useQuery<string[]>({
    queryKey: ['movie_watchlist'],
    queryFn: async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return [];

      const { data, error } = await supabase
        .from('movie_watchlist')
        .select('movie_id')
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      return (data ?? []).map((r) => r.movie_id as string);
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['movie_watchlist'] });
  };

  const addMutation = useMutation({
    mutationFn: async (movie_id: string) => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('movie_watchlist')
        .upsert({ user_id: user.id, movie_id }, { onConflict: 'user_id,movie_id' });

      if (error) throw error;
      return movie_id;
    },
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: async (movie_id: string) => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('movie_watchlist')
        .delete()
        .eq('user_id', user.id)
        .eq('movie_id', movie_id);

      if (error) throw error;
      return movie_id;
    },
    onSuccess: invalidate,
  });

  return {
    watchlist: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetchWatchlist: query.refetch,
    toggleWatchlist: async (movie_id: string) => {
      const saved = query.data?.includes(movie_id) ?? false;
      if (saved) {
        await removeMutation.mutateAsync(movie_id);
      } else {
        await addMutation.mutateAsync(movie_id);
      }
    },
    isToggling: addMutation.isPending || removeMutation.isPending,
    toggleError: addMutation.error ?? removeMutation.error ?? null,
    clearToggleError: () => {
      addMutation.reset();
      removeMutation.reset();
    },
  };
}
