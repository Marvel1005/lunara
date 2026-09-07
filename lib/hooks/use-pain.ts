import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { PainLog } from '@/lib/types/pain';

export function usePainLogs() {
  const queryClient = useQueryClient();

  const query = useQuery<PainLog[]>({
    queryKey: ['pain_logs'],
    queryFn: async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return [];

      const { data, error } = await supabase
        .from('pain_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching pain logs from Supabase:', error);
        return [];
      }

      return (data || []) as PainLog[];
    },
  });

  // Add Pain Log
  const addPainLogMutation = useMutation({
    mutationFn: async (newLog: {
      date: string;
      body_area: string;
      severity: number;
      pain_type?: string | null;
      notes?: string | null;
    }) => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('pain_logs')
        .insert({
          user_id: user.id,
          date: newLog.date,
          body_area: newLog.body_area,
          severity: Math.max(0, Math.min(10, newLog.severity)),
          pain_type: newLog.pain_type || null,
          notes: newLog.notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as PainLog;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pain_logs'] });
    },
  });

  // Update Pain Log
  const updatePainLogMutation = useMutation({
    mutationFn: async (updatedLog: {
      id: string;
      date?: string;
      body_area?: string;
      severity?: number;
      pain_type?: string | null;
      notes?: string | null;
    }) => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { id, ...payload } = updatedLog;

      const { data, error } = await supabase
        .from('pain_logs')
        .update(payload)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data as PainLog;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pain_logs'] });
    },
  });

  // Delete Pain Log
  const deletePainLogMutation = useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('pain_logs')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pain_logs'] });
    },
  });

  return {
    painLogs: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetchPainLogs: query.refetch,
    addPainLog: addPainLogMutation.mutateAsync,
    isAdding: addPainLogMutation.isPending,
    updatePainLog: updatePainLogMutation.mutateAsync,
    updatePainLogAsync: updatePainLogMutation.mutateAsync,
    isUpdating: updatePainLogMutation.isPending,
    deletePainLog: deletePainLogMutation.mutateAsync,
    isDeleting: deletePainLogMutation.isPending,
  };
}
