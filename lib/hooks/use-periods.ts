import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Period, FlowType } from '@/lib/cycle/types';

export function usePeriods() {
  const queryClient = useQueryClient();

  const query = useQuery<Period[]>({
    queryKey: ['periods'],
    queryFn: async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return [];

      const { data, error } = await supabase
        .from('periods')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: false });

      if (error) {
        console.error('Error fetching periods from Supabase:', error);
        return [];
      }

      return (data || []) as Period[];
    },
  });

  // Add Period
  const addPeriodMutation = useMutation({
    mutationFn: async (newPeriod: {
      start_date: string;
      end_date?: string | null;
      flow?: FlowType | null;
      notes?: string | null;
    }) => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('periods')
        .insert({
          user_id: user.id,
          start_date: newPeriod.start_date,
          end_date: newPeriod.end_date || null,
          flow: newPeriod.flow || null,
          notes: newPeriod.notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Period;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['periods'] });
    },
  });

  // Update Period
  const updatePeriodMutation = useMutation({
    mutationFn: async (updatedPeriod: {
      id: string;
      start_date?: string;
      end_date?: string | null;
      flow?: FlowType | null;
      notes?: string | null;
    }) => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { id, ...payload } = updatedPeriod;

      const { data, error } = await supabase
        .from('periods')
        .update(payload)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data as Period;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['periods'] });
    },
  });

  // Delete Period
  const deletePeriodMutation = useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('periods')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['periods'] });
    },
  });

  return {
    periods: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetchPeriods: query.refetch,
    addPeriod: addPeriodMutation.mutateAsync,
    isAdding: addPeriodMutation.isPending,
    updatePeriod: updatePeriodMutation.mutateAsync,
    isUpdating: updatePeriodMutation.isPending,
    deletePeriod: deletePeriodMutation.mutateAsync,
    isDeleting: deletePeriodMutation.isPending,
  };
}
