export type DayArcTheme = 'dawn' | 'daylight' | 'golden' | 'night';

export interface DayArcMetadata {
  theme: DayArcTheme;
  label: string;
  sublabel: string;
  kelvin: string;
  shutterHint: string;
  accentColor: string;
  glowColor: string;
}

export const DAY_ARC_PRESETS: Record<DayArcTheme, DayArcMetadata> = {
  dawn: {
    theme: 'dawn',
    label: 'Dawn Mist',
    sublabel: '05:00 - 08:00 • Morning mist & soft shadows',
    kelvin: '3200K',
    shutterHint: '1/250s • f/2.8 • ISO 200',
    accentColor: '#FDA4AF',
    glowColor: 'rgba(253, 164, 175, 0.3)',
  },
  daylight: {
    theme: 'daylight',
    label: 'High Daylight',
    sublabel: '08:00 - 16:00 • Crisp geometry & sharp lines',
    kelvin: '5600K',
    shutterHint: '1/1000s • f/5.6 • ISO 100',
    accentColor: '#0284C7',
    glowColor: 'rgba(2, 132, 199, 0.25)',
  },
  golden: {
    theme: 'golden',
    label: 'Golden Hour',
    sublabel: '16:00 - 19:00 • Warm amber sidelight & long rays',
    kelvin: '2800K',
    shutterHint: '1/500s • f/1.8 • ISO 400',
    accentColor: '#F59E0B',
    glowColor: 'rgba(245, 158, 11, 0.35)',
  },
  night: {
    theme: 'night',
    label: 'Night Exposure',
    sublabel: '19:00 - 05:00 • Silver halides & deep darkroom void',
    kelvin: '6500K',
    shutterHint: '1/60s • f/1.4 • ISO 1600',
    accentColor: '#F59E0B',
    glowColor: 'rgba(245, 158, 11, 0.25)',
  },
};

/**
 * Calculates the current Day Arc theme based on local time hour.
 * 05:00 - 08:00 -> dawn
 * 08:00 - 16:00 -> daylight
 * 16:00 - 19:00 -> golden
 * 19:00 - 05:00 -> night
 */
export function calculateCurrentDayArc(hour = new Date().getHours()): DayArcTheme {
  if (hour >= 5 && hour < 8) return 'dawn';
  if (hour >= 8 && hour < 16) return 'daylight';
  if (hour >= 16 && hour < 19) return 'golden';
  return 'night';
}
