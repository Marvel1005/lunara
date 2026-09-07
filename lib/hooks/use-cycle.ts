import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { CycleSettings } from '@/lib/cycle/types';
import { usePeriods } from '@/lib/hooks/use-periods';
import { calculateCycleSummary } from '@/lib/cycle/engine';

export function useCycleSettings() {
  const queryClient = useQueryClient();

  const query = useQuery<CycleSettings>({
    queryKey: ['cycle_settings'],
    queryFn: async () => {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return { average_cycle_length: 28, average_period_length: 5, auto_theme: true };
      }

      const { data, error } = await supabase
        .from('cycle_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching cycle settings:', error);
      }

      return data || {
        user_id: user.id,
        average_cycle_length: 28,
        average_period_length: 5,
        auto_theme: true,
      };
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (newSettings: Partial<CycleSettings>) => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const payload = {
        user_id: user.id,
        average_cycle_length: newSettings.average_cycle_length ?? 28,
        average_period_length: newSettings.average_period_length ?? 5,
        auto_theme: newSettings.auto_theme ?? true,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('cycle_settings')
        .upsert(payload, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cycle_settings'] });
      queryClient.invalidateQueries({ queryKey: ['periods'] });
    },
  });

  return {
    settings: query.data || { average_cycle_length: 28, average_period_length: 5, auto_theme: true },
    isLoading: query.isLoading,
    isError: query.isError,
    updateSettings: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}

export function useCycleSummary() {
  const { periods, isLoading: isLoadingPeriods } = usePeriods();
  const { settings, isLoading: isLoadingSettings } = useCycleSettings();

  const cycleSummary = calculateCycleSummary(periods, settings);

  return {
    cycleSummary,
    isLoading: isLoadingPeriods || isLoadingSettings,
  };
}
