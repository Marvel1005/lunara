export type PainSeverity = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type PainLocationKey =
  | 'lower_abdomen'
  | 'abdomen'
  | 'lower_back'
  | 'back'
  | 'head'
  | 'neck'
  | 'shoulders'
  | 'breasts'
  | 'pelvis'
  | 'hips'
  | 'thighs'
  | 'legs'
  | 'other';

export type PainTypeKey =
  | 'cramping'
  | 'aching'
  | 'sharp'
  | 'throbbing'
  | 'pressure'
  | 'burning'
  | 'stabbing'
  | 'tender'
  | 'other';

export interface PainLog {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  body_area: string; // Comma-separated or single location key
  severity: number; // 0 to 10
  pain_type?: string | null; // Comma-separated pain characteristic keys
  notes?: string | null;
  created_at: string;
}

export const PAIN_LOCATIONS: { key: PainLocationKey; label: string; iconEmoji: string }[] = [
  { key: 'lower_abdomen', label: 'Lower Abdomen / Cramps', iconEmoji: '🫄' },
  { key: 'abdomen', label: 'Abdomen', iconEmoji: '🧘' },
  { key: 'lower_back', label: 'Lower Back', iconEmoji: '🦴' },
  { key: 'back', label: 'Back', iconEmoji: '💆' },
  { key: 'head', label: 'Head', iconEmoji: '🤕' },
  { key: 'neck', label: 'Neck', iconEmoji: '🦒' },
  { key: 'shoulders', label: 'Shoulders', iconEmoji: '🤷' },
  { key: 'breasts', label: 'Breasts', iconEmoji: '🌸' },
  { key: 'pelvis', label: 'Pelvis', iconEmoji: '🎀' },
  { key: 'hips', label: 'Hips', iconEmoji: '🦵' },
  { key: 'thighs', label: 'Thighs', iconEmoji: '🏃' },
  { key: 'legs', label: 'Legs', iconEmoji: '🦶' },
  { key: 'other', label: 'Other', iconEmoji: '✨' },
];

export const PAIN_TYPES: { key: PainTypeKey; label: string }[] = [
  { key: 'cramping', label: 'Cramping' },
  { key: 'aching', label: 'Aching' },
  { key: 'sharp', label: 'Sharp' },
  { key: 'throbbing', label: 'Throbbing' },
  { key: 'pressure', label: 'Pressure' },
  { key: 'burning', label: 'Burning' },
  { key: 'stabbing', label: 'Stabbing' },
  { key: 'tender', label: 'Tender' },
  { key: 'other', label: 'Other' },
];

export function parseBodyAreas(raw?: string | null): PainLocationKey[] {
  if (!raw) return ['lower_abdomen'];
  if (raw.startsWith('[') && raw.endsWith(']')) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as PainLocationKey[];
    } catch {
      // fallback
    }
  }
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean) as PainLocationKey[];
}

export function formatBodyAreas(areas: PainLocationKey[]): string {
  if (!areas || areas.length === 0) return 'lower_abdomen';
  return areas.join(',');
}

export function parsePainTypes(raw?: string | null): PainTypeKey[] {
  if (!raw) return [];
  if (raw.startsWith('[') && raw.endsWith(']')) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as PainTypeKey[];
    } catch {
      // fallback
    }
  }
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean) as PainTypeKey[];
}

export function formatPainTypes(types: PainTypeKey[]): string {
  if (!types || types.length === 0) return '';
  return types.join(',');
}

export function getLocationLabel(key: PainLocationKey): string {
  const found = PAIN_LOCATIONS.find((l) => l.key === key);
  return found ? found.label : key;
}

export function getPainTypeLabel(key: PainTypeKey): string {
  const found = PAIN_TYPES.find((t) => t.key === key);
  return found ? found.label : key;
}

export function getSeverityDescriptor(severity: number): {
  label: string;
  description: string;
  colorClass: string;
  badgeBg: string;
} {
  if (severity === 0) {
    return {
      label: 'No Pain',
      description: 'Comfortable and feeling completely pain-free right now.',
      colorClass: 'text-emerald-700 font-bold',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    };
  }
  if (severity <= 2) {
    return {
      label: 'Very Mild',
      description: 'Barely noticeable sensation, easily manageable.',
      colorClass: 'text-teal-700 font-bold',
      badgeBg: 'bg-teal-100 text-teal-800 border-teal-300',
    };
  }
  if (severity <= 4) {
    return {
      label: 'Mild',
      description: 'Noticeable discomfort, but allows normal activity.',
      colorClass: 'text-amber-700 font-bold',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    };
  }
  if (severity <= 6) {
    return {
      label: 'Moderate',
      description: 'Interferes with focus. Calls for rest and comfort measures.',
      colorClass: 'text-orange-700 font-bold',
      badgeBg: 'bg-orange-100 text-orange-900 border-orange-300',
    };
  }
  if (severity <= 8) {
    return {
      label: 'Severe',
      description: 'Significant pain. Requires gentle care, rest, and pain management.',
      colorClass: 'text-rose-700 font-bold',
      badgeBg: 'bg-rose-100 text-rose-900 border-rose-300',
    };
  }
  return {
    label: 'Very Severe',
    description: 'Intense discomfort. Focus on resting in a safe, quiet sanctuary.',
    colorClass: 'text-purple-900 font-bold',
    badgeBg: 'bg-purple-200 text-purple-950 border-purple-400',
  };
}
