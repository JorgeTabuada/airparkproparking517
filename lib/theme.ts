import { StyleSheet } from 'react-native';

// Dark blue elegant palette - Airpark Pro branding
export const COLORS = {
  // Primary: Dark blue (logótipo Airpark Pro)
  primary: '#003D82', // Azul-escuro profundo
  primaryLight: '#0052A3', // Azul-escuro mais claro
  primaryLighter: '#1B6FD6', // Azul médio (para secondary actions)
  
  // Surface colors
  surface: '#FFFFFF',
  surfaceVariant: '#F5F7FA', // Muito claro, quase branco
  surfaceSecondary: '#EEF2F8', // Cinzento muito claro com tint azul
  
  // Text colors
  text: '#1A1A1A', // Quase preto
  textSecondary: '#5F6368', // Cinzento médio
  textTertiary: '#9AA0A6', // Cinzento claro
  textInverse: '#FFFFFF', // Branco para texto em fundo escuro
  
  // Accent colors
  success: '#34A853', // Verde sucesso
  warning: '#FBBC04', // Amarelo aviso
  error: '#EA4335', // Vermelho erro
  info: '#1B6FD6', // Azul informação
  
  // Neutral
  white: '#FFFFFF',
  black: '#000000',
  divider: '#E8EAED',
  border: '#DADCE0',
  
  // Semantic colors
  disabled: '#F8F9FA',
  disabledText: '#BDBDBD',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const TYPOGRAPHY = {
  display: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
  },
  heading1: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
  },
  heading2: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 30,
  },
  heading3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 26,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
};

export const SHADOWS = StyleSheet.create({
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
});

// Locale configuration - Portugal
export const LOCALE_CONFIG = {
  locale: 'pt-PT',
  timezone: 'Europe/Lisbon',
  currency: 'EUR',
  currencySymbol: '€',
};