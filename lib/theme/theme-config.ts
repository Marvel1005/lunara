import { ThemeStyle, ThemeMode } from '@/lib/cycle/types';

export interface ThemeConfig {
  id: ThemeStyle;
  name: string;
  subtitle: string;
  description: string;
  emoji: string;
  palette: {
    bg: string;
    cardBg: string;
    primary: string;
    secondary: string;
    accent: string;
    border: string;
    text: string;
    mutedText: string;
  };
  comfortPalette: {
    bg: string;
    cardBg: string;
    primary: string;
    accent: string;
    border: string;
  };
  emptyStateMessages: {
    journal: string;
    insights: string;
    pain: string;
    calendar: string;
  };
}

export const THEME_CONFIGS: Record<ThemeStyle, ThemeConfig> = {
  'soft-floral': {
    id: 'soft-floral',
    name: 'Soft Floral',
    subtitle: 'Gentle botanical sanctuary',
    description: 'Surrounded by delicate botanical line-art, soft eucalyptus sprigs, and soothing rosewood-sage tones.',
    emoji: '🌸',
    palette: {
      bg: '#FAF7F2',
      cardBg: 'rgba(255, 253, 250, 0.92)',
      primary: '#C08594',
      secondary: '#E1ECE3',
      accent: '#7FA382',
      border: '#E5D8CF',
      text: '#2C2426',
      mutedText: '#7D7073',
    },
    comfortPalette: {
      bg: '#FAF4F2',
      cardBg: 'rgba(255, 247, 245, 0.94)',
      primary: '#BE7283',
      accent: '#8FA693',
      border: '#ECDAD1',
    },
    emptyStateMessages: {
      journal: 'Sometimes putting it into words helps. Write your first gentle reflection.',
      insights: "We're still getting to know your rhythm. Keep checking in and we'll uncover your patterns.",
      pain: "Hopefully it stays calm. If you feel any discomfort, we'll be right here.",
      calendar: 'Your cycle story will start unfolding here as you log dates.',
    },
  },
  'cute-cozy': {
    id: 'cute-cozy',
    name: 'Cute & Cozy',
    subtitle: 'Warm & playful sanctuary',
    description: 'Playful rounded hearts, puffy clouds, honey sparkles, and warm comforting strawberry-coral tones.',
    emoji: '🧸',
    palette: {
      bg: '#FFF5E8',
      cardBg: 'rgba(255, 252, 244, 0.93)',
      primary: '#E8736B',
      secondary: '#FCE6B8',
      accent: '#F5B85C',
      border: '#F5CEB8',
      text: '#3B2421',
      mutedText: '#876F74',
    },
    comfortPalette: {
      bg: '#FFF3EF',
      cardBg: 'rgba(255, 245, 241, 0.95)',
      primary: '#DE6F83',
      accent: '#F1AA8A',
      border: '#F7CEC2',
    },
    emptyStateMessages: {
      journal: 'A quiet space for your cozy thoughts and daily feelings.',
      insights: "We're taking things one step at a time. Log a few check-ins to see cozy patterns.",
      pain: "All clear for now! Whenever you need comfort, we're ready.",
      calendar: 'Your cozy calendar will keep track of your rhythms and rest days.',
    },
  },
  'lavender-dream': {
    id: 'lavender-dream',
    name: 'Lavender Dream',
    subtitle: 'Dreamy celestial sanctuary',
    description: 'Soothing crescent moons, gentle constellation dots, and peaceful lavender hues.',
    emoji: '💜',
    palette: {
      bg: '#FAF8FE',
      cardBg: 'rgba(255, 253, 255, 0.9)',
      primary: '#8E7BB0',
      secondary: '#E3DCF2',
      accent: '#C4B5E0',
      border: '#E8E0F4',
      text: '#2C2638',
      mutedText: '#766D85',
    },
    comfortPalette: {
      bg: '#F7F3FD',
      cardBg: 'rgba(253, 249, 255, 0.94)',
      primary: '#856EAA',
      accent: '#BBA7DD',
      border: '#E3D7F2',
    },
    emptyStateMessages: {
      journal: 'Whisper your thoughts into a peaceful starry space.',
      insights: "We're observing your rhythm beneath the stars. Check-in regularly for dream insights.",
      pain: 'Peaceful moments ahead. If pain arises, tap anytime for soothing care.',
      calendar: 'Chart your moon phases and cycle story month by month.',
    },
  },
  'peach-calm': {
    id: 'peach-calm',
    name: 'Peach Calm',
    subtitle: 'Warm sunny optimism',
    description: 'Cozy morning sunlight, gentle rays, soft organic curves, and optimistic peach-terracotta tones.',
    emoji: '🍑',
    palette: {
      bg: '#FDF7F3',
      cardBg: 'rgba(255, 251, 247, 0.9)',
      primary: '#D9836C',
      secondary: '#F7DCD2',
      accent: '#EEB5A3',
      border: '#F6DFC7',
      text: '#332622',
      mutedText: '#826F69',
    },
    comfortPalette: {
      bg: '#FCF2EB',
      cardBg: 'rgba(255, 246, 240, 0.94)',
      primary: '#D7765D',
      accent: '#EAA794',
      border: '#F4D3B8',
    },
    emptyStateMessages: {
      journal: 'A warm morning page for your thoughts, hopes, and feelings.',
      insights: "Sunnier insights are on the horizon. We'll map your patterns as you check in.",
      pain: "Feeling peaceful right now. We'll be here whenever you need warm relief.",
      calendar: 'Your cycle calendar bringing clarity to every sunny and quiet day.',
    },
  },
  'warm-minimal': {
    id: 'warm-minimal',
    name: 'Warm Minimal',
    subtitle: 'Quiet elegant sanctuary',
    description: 'Restrained, ultra-clean lines, delicate curves, and calm sandstone-rose hues.',
    emoji: '🌿',
    palette: {
      bg: '#FDFBF7',
      cardBg: 'rgba(255, 255, 255, 0.88)',
      primary: '#9C727D',
      secondary: '#E6E1F4',
      accent: '#E8C5C8',
      border: '#EFE8DF',
      text: '#2D2628',
      mutedText: '#7A6F73',
    },
    comfortPalette: {
      bg: '#FCF6F2',
      cardBg: 'rgba(255, 248, 245, 0.94)',
      primary: '#A66E7C',
      accent: '#ECCACD',
      border: '#F1DED6',
    },
    emptyStateMessages: {
      journal: 'A clean, uncluttered space for intentional thoughts.',
      insights: "We're collecting your cycle data quietly in the background.",
      pain: "No pain recorded. We'll keep things simple and supportive.",
      calendar: 'Clean, elegant timeline of your recorded cycle events.',
    },
  },
  'midnight-comfort': {
    id: 'midnight-comfort',
    name: 'Midnight Comfort',
    subtitle: 'Cozy night sanctuary',
    description: 'Deep nocturnal quiet, soft starlight glows, glowing crescents, and soothing deep violet-plum atmosphere.',
    emoji: '🌙',
    palette: {
      bg: '#18141F',
      cardBg: 'rgba(30, 24, 40, 0.85)',
      primary: '#B28BC7',
      secondary: '#2C2338',
      accent: '#9A72B8',
      border: '#3A2F47',
      text: '#F5EEF8',
      mutedText: '#AA9BB8',
    },
    comfortPalette: {
      bg: '#191118',
      cardBg: 'rgba(38, 22, 31, 0.9)',
      primary: '#DF8296',
      accent: '#C76B7E',
      border: '#4A2733',
    },
    emptyStateMessages: {
      journal: 'Unwind under the quiet night sky. Log your evening thoughts.',
      insights: "Gathering nocturnal rhythms. Your patterns will emerge over time.",
      pain: 'Resting quietly. Emergency comfort measures ready whenever needed.',
      calendar: 'Nocturnal view of your past cycles and projected period dates.',
    },
  },
};

export function getThemeConfig(style: ThemeStyle): ThemeConfig {
  return THEME_CONFIGS[style] || THEME_CONFIGS['warm-minimal'];
}
