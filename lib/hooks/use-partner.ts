'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type {
  PartnerConnectionItem,
  SharedPartnerStatus,
  CreateInvitationResult,
  AcceptInvitationResult,
  PartnerPermissions,
} from '@/lib/partner/types';

// ─────────────────────────────────────────────────────────────────────────────
// PRIMARY USER HOOKS
// ─────────────────────────────────────────────────────────────────────────────

export interface PendingInvitation {
  id: string;
  invitee_email: string;
  partner_name?: string | null;
  status: string;
  expires_at: string;
  created_at: string;
}

export function useMyPartnerConnections() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  const query = useQuery<PartnerConnectionItem[]>({
    queryKey: ['partner_connections'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.rpc('get_my_partner_connections');
        if (error) {
          console.warn('get_my_partner_connections warning:', error.message);
          return [];
        }
        return (data as { connections: PartnerConnectionItem[] })?.connections ?? [];
      } catch (err) {
        console.warn('get_my_partner_connections fetch error:', err);
        return [];
      }
    },
  });

  // Query pending invitations sent by the current user
  const pendingQuery = useQuery<PendingInvitation[]>({
    queryKey: ['pending_partner_invitations'],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];
        const { data, error } = await supabase
          .from('partner_invitations')
          .select('id, invitee_email, partner_name, status, expires_at, created_at')
          .eq('inviter_user_id', user.id)
          .eq('status', 'pending')
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false });
        if (error) {
          console.warn('partner_invitations query warning:', error.message);
          return [];
        }
        return (data as PendingInvitation[]) ?? [];
      } catch {
        return [];
      }
    },
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['partner_connections'] });
    queryClient.invalidateQueries({ queryKey: ['pending_partner_invitations'] });
  };

  // Create invitation
  const createInvitationMutation = useMutation({
    mutationFn: async (args: { invitee_email: string; partner_name?: string }) => {
      const { data, error } = await supabase.rpc('create_partner_invitation', {
        p_invitee_email: args.invitee_email,
        p_partner_name: args.partner_name ?? null,
      });
      if (error) throw new Error(error.message);
      return data as CreateInvitationResult;
    },
    onSuccess: invalidateAll,
  });

  // Cancel invitation
  const cancelInvitationMutation = useMutation({
    mutationFn: async (invitation_id: string) => {
      const { data, error } = await supabase.rpc('cancel_partner_invitation', {
        p_invitation_id: invitation_id,
      });
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: invalidateAll,
  });

  // Update permissions
  const updatePermissionsMutation = useMutation({
    mutationFn: async (args: { connection_id: string; permissions: PartnerPermissions }) => {
      const p = args.permissions;
      const { data, error } = await supabase.rpc('update_partner_permissions', {
        p_connection_id: args.connection_id,
        p_share_general_status: p.share_general_status,
        p_share_pain_status: p.share_pain_status,
        p_share_pain_severity: p.share_pain_severity,
        p_share_pain_location: p.share_pain_location,
        p_share_pain_type: p.share_pain_type,
        p_share_mood: p.share_mood,
        p_share_sleep: p.share_sleep,
        p_share_water: p.share_water,
        p_share_energy: p.share_energy,
        p_share_cycle_status: p.share_cycle_status,
        p_share_period_status: p.share_period_status,
        p_share_comfort_requests: p.share_comfort_requests,
        p_custom_status_message: p.custom_status_message ?? null,
      });
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner_connections'] });
      queryClient.invalidateQueries({ queryKey: ['shared_partner_status'] });
    },
  });

  // Pause connection
  const pauseMutation = useMutation({
    mutationFn: async (connection_id: string) => {
      const { data, error } = await supabase.rpc('pause_partner_connection', {
        p_connection_id: connection_id,
      });
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['partner_connections'] }),
  });

  // Resume connection
  const resumeMutation = useMutation({
    mutationFn: async (connection_id: string) => {
      const { data, error } = await supabase.rpc('resume_partner_connection', {
        p_connection_id: connection_id,
      });
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: invalidateAll,
  });

  // Revoke connection
  const revokeMutation = useMutation({
    mutationFn: async (connection_id: string) => {
      const { data, error } = await supabase.rpc('revoke_partner_connection', {
        p_connection_id: connection_id,
      });
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: invalidateAll,
  });

  const activeConnection = query.data?.find((c) => c.status === 'active') ?? null;
  const pausedConnection = query.data?.find((c) => c.status === 'paused') ?? null;
  const liveConnection = activeConnection ?? pausedConnection ?? null;

  return {
    connections: query.data ?? [],
    activeConnection,
    pausedConnection,
    liveConnection,
    pendingInvitations: pendingQuery.data ?? [],
    isPendingLoading: pendingQuery.isLoading,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => {
      query.refetch();
      pendingQuery.refetch();
    },
    createInvitation: createInvitationMutation.mutateAsync,
    isCreatingInvitation: createInvitationMutation.isPending,
    cancelInvitation: cancelInvitationMutation.mutateAsync,
    isCancellingInvitation: cancelInvitationMutation.isPending,
    updatePermissions: updatePermissionsMutation.mutateAsync,
    isUpdatingPermissions: updatePermissionsMutation.isPending,
    pauseConnection: pauseMutation.mutateAsync,
    isPausing: pauseMutation.isPending,
    resumeConnection: resumeMutation.mutateAsync,
    isResuming: resumeMutation.isPending,
    revokeConnection: revokeMutation.mutateAsync,
    isRevoking: revokeMutation.isPending,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// PARTNER USER HOOKS
// ─────────────────────────────────────────────────────────────────────────────

export function useSharedPartnerStatus(connection_id: string | null) {
  const supabase = createClient();

  return useQuery<SharedPartnerStatus>({
    queryKey: ['shared_partner_status', connection_id],
    enabled: !!connection_id,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_shared_partner_status', {
        p_connection_id: connection_id!,
      });
      if (error) throw new Error(error.message);
      return data as SharedPartnerStatus;
    },
    refetchInterval: 60_000, // refresh every 60s
  });
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (raw_token: string) => {
      const { data, error } = await supabase.rpc('accept_partner_invitation', {
        p_raw_token: raw_token,
      });
      if (error) throw new Error(error.message);
      return data as AcceptInvitationResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner_connections'] });
      queryClient.invalidateQueries({ queryKey: ['shared_partner_status'] });
    },
  });
}

// Connections where the current user is the *partner* (not the primary owner)
export function usePartnerViewConnections() {
  const supabase = createClient();

  return useQuery<{ connection_id: string; user_id: string; status: string }[]>({
    queryKey: ['partner_view_connections'],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
          .from('partner_connections')
          .select('id, user_id, status')
          .eq('partner_user_id', user.id);

        if (error) {
          console.warn('partner_view_connections warning:', error.message);
          return [];
        }
        return (data ?? []).map((r) => ({
          connection_id: r.id,
          user_id: r.user_id,
          status: r.status,
        }));
      } catch (err) {
        console.warn('partner_view_connections fetch error:', err);
        return [];
      }
    },
  });
}
