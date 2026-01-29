import React from 'react';
import { View, Image, ViewStyle, TouchableOpacity } from 'react-native';
import { ColorPalette, useTheme } from '../../theme';
import { Text } from '../Text';

export interface AvatarProps {
  source?: { uri: string };
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  backgroundColor?: string;
  textColor?: Exclude<
    keyof ColorPalette,
    'background' | 'surface' | 'overlay' | 'surfaceDisabled' | 'disabled'
  >;
  style?: ViewStyle;
  onPress?: () => void;
}

/**
 * Genera un color basado en el nombre del usuario para consistencia
 */
const generateColorFromName = (name: string): string => {
  const colors = [
    '#007AFF', // Azul
    '#34C759', // Verde
    '#FF9500', // Naranja
    '#FF3B30', // Rojo
    '#AF52DE', // Púrpura
    '#FF2D55', // Rosa
    '#5AC8FA', // Azul claro
    '#FFCC00', // Amarillo
    '#5856D6', // Índigo
    '#FF6B6B', // Coral
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

/**
 * Componente de avatar
 */
export const Avatar: React.FC<AvatarProps> = ({
  source,
  name,
  size = 'md',
  backgroundColor,
  textColor = 'textPrimary',
  style,
  onPress,
}) => {
  const { theme } = useTheme();

  const sizes = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 56,
    xl: 96,
  };

  const sizeValue = typeof size === 'number' ? size : sizes[size];

  const getInitials = (userName: string): string => {
    if (!userName || userName.trim().length === 0) return '?';
    const parts = userName
      .trim()
      .split(' ')
      .filter(p => p.length > 0);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    if (parts.length === 1 && parts[0].length >= 2) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return userName.substring(0, 1).toUpperCase();
  };

  const bgColor = backgroundColor || (name ? generateColorFromName(name) : theme.colors.accent);

  const containerStyle: ViewStyle = {
    width: sizeValue,
    height: sizeValue,
    borderRadius: sizeValue / 2,
    backgroundColor: bgColor,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  };

  const avatarContent = source?.uri ? (
    <View style={[containerStyle, style]}>
      <Image source={source} style={{ width: sizeValue, height: sizeValue }} resizeMode="cover" />
    </View>
  ) : (
    <View style={[containerStyle, style]}>
      <Text variant="caption" color={textColor}>
        {name ? getInitials(name) : '?'}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {avatarContent}
      </TouchableOpacity>
    );
  }

  return avatarContent;
};
