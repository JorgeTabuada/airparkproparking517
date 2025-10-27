import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../lib/theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export default function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  fullWidth = false,
  loading = false,
  style,
}: ButtonProps) {
  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'small':
        return {
          container: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md },
          text: TYPOGRAPHY.label,
        };
      case 'large':
        return {
          container: { paddingVertical: SPACING.lg, paddingHorizontal: SPACING.xl },
          text: TYPOGRAPHY.subtitle,
        };
      case 'medium':
      default:
        return {
          container: { paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg },
          text: TYPOGRAPHY.body,
        };
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          container: { backgroundColor: COLORS.surfaceSecondary },
          text: { color: COLORS.primary },
        };
      case 'outline':
        return {
          container: { backgroundColor: 'transparent', borderWidth: 2, borderColor: COLORS.primary },
          text: { color: COLORS.primary },
        };
      case 'primary':
      default:
        return {
          container: { backgroundColor: COLORS.primary },
          text: { color: COLORS.textInverse },
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        sizeStyles.container,
        variantStyles.container,
        disabled && styles.disabled,
        fullWidth && styles.fullWidth,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      <Text
        style={[
          sizeStyles.text,
          variantStyles.text,
          disabled && { color: COLORS.disabledText },
        ]}
      >
        {loading ? 'Carregando...' : label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
});