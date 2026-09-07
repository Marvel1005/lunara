export type PartnerConnectionStatus = 'active' | 'paused' | 'revoked';
export type PartnerInvitationStatus = 'pending' | 'accepted' | 'cancelled' | 'expired';

export interface PartnerPermissions {
  share_general_status: boolean;
  share_pain_status: boolean;
  share_pain_severity: boolean;
  share_pain_location: boolean;
  share_pain_type: boolean;
  share_mood: boolean;
  share_sleep: boolean;
  share_water: boolean;
  share_energy: boolean;
  share_cycle_status: boolean;
  share_period_status: boolean;
  share_comfort_requests: boolean;
  custom_status_message?: string | null;
}

export interface PartnerConnectionItem {
  connection_id: string;
  partner_user_id: string;
  status: PartnerConnectionStatus;
  created_at: string;
  accepted_at: string;
  permissions: PartnerPermissions;
}

export interface SharedPartnerStatus {
  connection_status?: PartnerConnectionStatus;
  user_name?: string;
  shared_summary?: string;
  general_status_message?: string | null;
  custom_comfort_request?: string | null;
  is_period_active?: boolean;
  cycle_phase?: string;
  cycle_phase_is_estimated?: boolean;
  has_pain_today?: boolean;
  pain_status_message?: string;
  pain_severity?: number;
  pain_location?: string;
  pain_type?: string;
  mood?: string;
  mood_intensity?: number;
  sleep_hours?: number;
  sleep_quality?: number;
  water_ml?: number;
  energy?: string;
  error?: string;
}

export interface CreateInvitationResult {
  invitation_id: string;
  invitee_email: string;
  raw_token: string;
  expires_at: string;
}

export interface AcceptInvitationResult {
  success: boolean;
  connection_id: string;
  status: PartnerConnectionStatus;
}
