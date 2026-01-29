import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { ColorPalette, useTheme, Typography } from '../../theme';

export type TextVariant = keyof Typography;

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: Exclude<
    keyof ColorPalette,
    'background' | 'surface' | 'overlay' | 'surfaceDisabled' | 'disabled'
  >;
  align?: 'left' | 'center' | 'right';
  children: React.ReactNode;
}

/**
 * Componente de texto con soporte de tema
 */
export const Text: React.FC<TextProps> = ({
  variant = 'body',
  color = 'textPrimary',
  align = 'left',
  style,
  children,
  ...props
}) => {
  const { theme } = useTheme();

  return (
    <RNText
      style={[
        styles.base,
        theme.typography[variant],
        {
          color: theme.colors[color],
          textAlign: align,
        },
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
