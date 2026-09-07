export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

export type FlowType = 'spotting' | 'light' | 'medium' | 'heavy';

export type ThemeStyle = 'warm-minimal' | 'soft-floral' | 'cute-cozy' | 'lavender-dream' | 'peach-calm' | 'midnight-comfort';

export type ThemeMode = 'normal' | 'comfort' | 'pre-period' | 'post-period' | 'ovulation';

export interface Period {
  id: string;
  user_id: string;
  start_date: string; // YYYY-MM-DD
  end_date: string | null; // YYYY-MM-DD
  flow: FlowType | null;
  notes: string | null;
  created_at: string;
}

export interface CycleSettings {
  id?: string;
  user_id?: string;
  average_cycle_length: number;
  average_period_length: number;
  auto_theme: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CycleCalculationResult {
  currentCycleDay: number;
  totalCycleLength: number;
  averagePeriodLength: number;
  phase: CyclePhase;
  phaseName: string;
  phaseDescription: string;
  isPeriod: boolean;
  periodDay?: number;
  daysRemainingInPeriod?: number;
  daysUntilNextPeriod: number;
  nextPeriodStartDate: Date;
  nextPeriodEndDate: Date;
  estimatedOvulationDate: Date;
  estimatedFertileWindow: { start: Date; end: Date };
  lastPeriodStartDate: Date | null;
  hasCycleData: boolean;
  activePeriod: Period | null;
  disclaimer: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatarUrl?: string;
  createdAt: string;
}
