import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { ColorPalette, useTheme } from '../../theme';

export type TextVariant = 'title' | 'subtitle' | 'body' | 'caption' | 'label';

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: keyof ColorPalette['content'] | keyof ColorPalette['status'];
  align?: 'left' | 'center' | 'right';
  children: React.ReactNode;
}

/**
 * Componente de texto con soporte de tema
 */
export const Text: React.FC<TextProps> = ({
  variant = 'body',
  color = 'primary',
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
          color:
            color in theme.colors.content
              ? theme.colors.content[color as keyof typeof theme.colors.content]
              : theme.colors.status[color as keyof typeof theme.colors.status],
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
