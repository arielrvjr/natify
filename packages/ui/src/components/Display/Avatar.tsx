import React from 'react';
import { View, Image, ViewStyle, TouchableOpacity, Platform, Text as RNText } from 'react-native';
import { useTheme } from '../../theme';

export interface AvatarProps {
  source?: { uri: string };
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  backgroundColor?: string;
  textColor?: string;
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
  textColor,
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
  const fontSize = sizeValue * 0.36; // Reducido ligeramente para evitar cortes
  const lineHeight = fontSize * 1.0; // LineHeight igual al fontSize para evitar cortes
  const borderWidth = sizeValue >= 56 ? 4 : sizeValue >= 40 ? 3 : 2;

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

  const bgColor = backgroundColor || (name ? generateColorFromName(name) : theme.colors.primary);
  const txtColor = textColor || theme.colors.white;

  const containerStyle: ViewStyle = {
    width: sizeValue,
    height: sizeValue,
    borderRadius: sizeValue / 2,
    backgroundColor: bgColor,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: borderWidth,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    ...Platform.select({
      ios: {
        shadowColor: bgColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  };

  const avatarContent = source?.uri ? (
    <View style={[containerStyle, style]}>
      <Image source={source} style={{ width: sizeValue, height: sizeValue }} resizeMode="cover" />
    </View>
  ) : (
    <View
      style={[
        containerStyle,
        style,
        {
          // Asegurar centrado perfecto del texto
          paddingTop: 0,
          paddingBottom: 0,
        },
      ]}
    >
      <RNText
        style={{
          fontSize,
          lineHeight,
          color: txtColor,
          fontWeight: '700',
          letterSpacing: sizeValue >= 56 ? 1 : 0.5,
          textShadowColor: 'rgba(0, 0, 0, 0.1)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 2,
          textAlign: 'center',
          includeFontPadding: false, // Eliminar padding extra en ambos sistemas
          ...Platform.select({
            android: {
              textAlignVertical: 'center',
            },
          }),
        }}
      >
        {name ? getInitials(name) : '?'}
      </RNText>
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
