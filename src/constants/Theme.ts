export const Colors = {
  light: {
    primary: '#6F42E5', // Urban Company Indigo/Purple
    primaryLight: '#F5F3FF',
    primaryHover: '#5B21B6',
    background: '#FFFFFF',
    surface: '#F8F9FA',
    surfaceAlt: '#F3F4F6',
    text: '#1F2937',
    textSecondary: '#4B5563',
    textMuted: '#9CA3AF',
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
  },
  dark: {
    primary: '#8B5CF6',
    primaryLight: '#1E1B4B',
    primaryHover: '#A78BFA',
    background: '#0F172A',
    surface: '#1E293B',
    surfaceAlt: '#334155',
    text: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textMuted: '#94A3B8',
    border: '#334155',
    borderLight: '#1E293B',
    error: '#F87171',
    success: '#34D399',
    warning: '#FBBF24',
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
  },
};

export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 9999,
};

export const Typography = {
  h1: { fontSize: 32, fontWeight: '800' as const, lineHeight: 40, letterSpacing: -0.5 },
  h2: { fontSize: 24, fontWeight: '700' as const, lineHeight: 32, letterSpacing: -0.3 },
  h3: { fontSize: 20, fontWeight: '700' as const, lineHeight: 28 },
  h4: { fontSize: 18, fontWeight: '600' as const, lineHeight: 28 },
  body1: { fontSize: 16, fontWeight: '500' as const, lineHeight: 24 },
  body2: { fontSize: 14, fontWeight: '500' as const, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  tiny: { fontSize: 10, fontWeight: '600' as const, lineHeight: 14 },
};

export const Shadows = {
  light: {
    xs: {
      shadowColor: '#6F42E5',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 1.5,
      elevation: 1,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
    md: {
      shadowColor: '#6F42E5',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.12,
      shadowRadius: 20,
      elevation: 6,
    },
    lg: {
      shadowColor: '#6F42E5',
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.18,
      shadowRadius: 30,
      elevation: 12,
    },
  },
  dark: {
    // Dark mode shadows refined for depth on black
    xs: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.3, shadowRadius: 2, elevation: 1 },
    sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8, elevation: 3 },
    md: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.7, shadowRadius: 16, elevation: 6 },
    lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.9, shadowRadius: 30, elevation: 12 },
  },
};

