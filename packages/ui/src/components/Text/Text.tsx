import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

export type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'bodySmall' | 'caption' | 'label';
export type TextWeight = 'regular' | 'medium' | 'bold';

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  weight?: TextWeight;
  color?: string;
  align?: 'left' | 'center' | 'right';
  children: React.ReactNode;
}

/**
 * Componente de texto con soporte de tema
 */
export const Text: React.FC<TextProps> = ({
  variant = 'body',
  weight = 'regular',
  color,
  align = 'left',
  style,
  children,
  ...props
}) => {
  const { theme } = useTheme();

  const variantStyles = {
    h1: { fontSize: theme.typography.fontSize.xxxl, lineHeight: 40 },
    h2: { fontSize: theme.typography.fontSize.xxl, lineHeight: 32 },
    h3: { fontSize: theme.typography.fontSize.xl, lineHeight: 28 },
    h4: { fontSize: theme.typography.fontSize.lg, lineHeight: 24 },
    body: { fontSize: theme.typography.fontSize.md, lineHeight: 22 },
    bodySmall: { fontSize: theme.typography.fontSize.sm, lineHeight: 18 },
    caption: { fontSize: theme.typography.fontSize.xs, lineHeight: 14 },
    label: { fontSize: theme.typography.fontSize.sm, lineHeight: 16 },
  };

  const weightStyles = {
    regular: { fontWeight: '400' as const },
    medium: { fontWeight: '500' as const },
    bold: { fontWeight: '700' as const },
  };

  return (
    <RNText
      style={[
        styles.base,
        variantStyles[variant],
        weightStyles[weight],
        { color: color || theme.colors.text, textAlign: align },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  base: {
    fontFamily: 'System',
  },
});
