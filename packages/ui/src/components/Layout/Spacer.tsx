import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../theme';

export interface SpacerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  horizontal?: boolean;
  flex?: number;
}

/**
 * Componente de espaciado
 */
export const Spacer: React.FC<SpacerProps> = ({ size = 'md', horizontal = false, flex }) => {
  const { theme } = useTheme();

  if (flex !== undefined) {
    return <View style={{ flex }} />;
  }

  const sizeValue = typeof size === 'number' ? size : theme.spacing[size];

  return <View style={horizontal ? { width: sizeValue } : { height: sizeValue }} />;
};
