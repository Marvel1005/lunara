'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';

export interface WellnessRecord {
  id?: string;
  date: string;
  water_ml: number;
  sleep_hours: number;
  sleep_quality: number | null;
  energy: string | null;
  activity?: string | null;
}

export interface MoodRecord {
  id?: string;
  date: string;
  mood: string;
  intensity: number | null;
  notes?: string | null;
}

export function useTodayWellness() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const query = useQuery<WellnessRecord | null>({
    queryKey: ['wellness_log_today', todayStr],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('wellness_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', todayStr)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Failed to fetch today wellness log:', error);
      }

      return data as WellnessRecord | null;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (updates: Partial<WellnessRecord>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const existing = query.data;

      if (existing?.id) {
        const { data, error } = await supabase
          .from('wellness_logs')
          .update({
            water_ml: updates.water_ml ?? existing.water_ml,
            sleep_hours: updates.sleep_hours ?? existing.sleep_hours,
            sleep_quality: updates.sleep_quality ?? existing.sleep_quality,
            energy: updates.energy ?? existing.energy,
            activity: updates.activity ?? existing.activity,
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data as WellnessRecord;
      } else {
        const { data, error } = await supabase
          .from('wellness_logs')
          .insert({
            user_id: user.id,
            date: todayStr,
            water_ml: updates.water_ml ?? 0,
            sleep_hours: updates.sleep_hours ?? 0,
            sleep_quality: updates.sleep_quality ?? null,
            energy: updates.energy ?? null,
            activity: updates.activity ?? null,
          })
          .select()
          .single();

        if (error) throw error;
        return data as WellnessRecord;
      }
    },
    onMutate: async (newUpdates) => {
      await queryClient.cancelQueries({ queryKey: ['wellness_log_today', todayStr] });
      const previous = queryClient.getQueryData<WellnessRecord | null>(['wellness_log_today', todayStr]);
      queryClient.setQueryData<WellnessRecord | null>(['wellness_log_today', todayStr], (old) => ({
        date: todayStr,
        water_ml: newUpdates.water_ml ?? old?.water_ml ?? 0,
        sleep_hours: newUpdates.sleep_hours ?? old?.sleep_hours ?? 0,
        sleep_quality: newUpdates.sleep_quality ?? old?.sleep_quality ?? null,
        energy: newUpdates.energy ?? old?.energy ?? null,
        activity: newUpdates.activity ?? old?.activity ?? null,
      }));
      return { previous };
    },
    onError: (_err, _newUpdates, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(['wellness_log_today', todayStr], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['wellness_log_today', todayStr] });
      queryClient.invalidateQueries({ queryKey: ['shared_partner_status'] });
    },
  });

  return {
    wellness: query.data,
    isLoading: query.isLoading,
    waterMl: query.data?.water_ml ?? 0,
    sleepHours: query.data?.sleep_hours ?? 0,
    energy: query.data?.energy ?? null,
    updateWellness: saveMutation.mutateAsync,
    isUpdating: saveMutation.isPending,
  };
}

export function useTodayMood() {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const query = useQuery<MoodRecord | null>({
    queryKey: ['mood_log_today', todayStr],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('mood_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', todayStr)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Failed to fetch today mood log:', error);
      }

      return data as MoodRecord | null;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (args: { mood: string; intensity?: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const existing = query.data;

      if (existing?.id) {
        const { data, error } = await supabase
          .from('mood_logs')
          .update({
            mood: args.mood,
            intensity: args.intensity ?? existing.intensity ?? 3,
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data as MoodRecord;
      } else {
        const { data, error } = await supabase
          .from('mood_logs')
          .insert({
            user_id: user.id,
            date: todayStr,
            mood: args.mood,
            intensity: args.intensity ?? 3,
          })
          .select()
          .single();

        if (error) throw error;
        return data as MoodRecord;
      }
    },
    onMutate: async (newArgs) => {
      await queryClient.cancelQueries({ queryKey: ['mood_log_today', todayStr] });
      const previous = queryClient.getQueryData<MoodRecord | null>(['mood_log_today', todayStr]);
      queryClient.setQueryData<MoodRecord | null>(['mood_log_today', todayStr], {
        date: todayStr,
        mood: newArgs.mood,
        intensity: newArgs.intensity ?? 3,
      } as MoodRecord);
      return { previous };
    },
    onError: (_err, _newArgs, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(['mood_log_today', todayStr], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['mood_log_today', todayStr] });
      queryClient.invalidateQueries({ queryKey: ['shared_partner_status'] });
    },
  });

  return {
    moodRecord: query.data,
    mood: query.data?.mood ?? null,
    isLoading: query.isLoading,
    setMood: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
  };
}
