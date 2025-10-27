import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SPACING, SHADOWS, BORDER_RADIUS } from '../lib/theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'filled' | 'outline';
  style?: ViewStyle;
  onPress?: () => void;
}

export default function Card({
  children,
  variant = 'filled',
  style,
  onPress,
}: CardProps) {
  const getVariantStyles = (): (ViewStyle | number)[] => {
    switch (variant) {
      case 'elevated':
        return [
          { backgroundColor: COLORS.surface },
          SHADOWS.md,
        ];
      case 'outline':
        return [
          { backgroundColor: COLORS.surfaceVariant, borderWidth: 1, borderColor: COLORS.border },
        ];
      case 'filled':
      default:
        return [
          { backgroundColor: COLORS.surface },
          SHADOWS.sm,
        ];
    }
  };

  return (
    <View
      style={[
        styles.card,
        ...getVariantStyles(),
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
});