import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../theme';
import { Text } from '../Text';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastConfig {
  message: string;
  type?: ToastType;
  duration?: number;
  position?: 'top' | 'bottom';
}

interface ToastState extends ToastConfig {
  id: number;
}

interface ToastContextValue {
  show: (config: ToastConfig) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Hook para mostrar toasts
 */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

/**
 * Provider de toasts
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const idRef = useRef(0);

  const show = useCallback((config: ToastConfig) => {
    const id = ++idRef.current;
    setToasts(prev => [...prev, { ...config, id }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, config.duration || 3000);
  }, []);

  const success = useCallback((message: string) => show({ message, type: 'success' }), [show]);
  const error = useCallback((message: string) => show({ message, type: 'error' }), [show]);
  const warning = useCallback((message: string) => show({ message, type: 'warning' }), [show]);
  const info = useCallback((message: string) => show({ message, type: 'info' }), [show]);

  return (
    <ToastContext.Provider value={{ show, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  );
};

/**
 * Contenedor de toasts
 */
const ToastContainer: React.FC<{ toasts: ToastState[] }> = ({ toasts }) => {
  const topToasts = toasts.filter(t => t.position !== 'bottom');
  const bottomToasts = toasts.filter(t => t.position === 'bottom');

  return (
    <>
      <View style={[styles.container, styles.topContainer]} pointerEvents="box-none">
        {topToasts.map(toast => (
          <ToastItem key={toast.id} {...toast} />
        ))}
      </View>
      <View style={[styles.container, styles.bottomContainer]} pointerEvents="box-none">
        {bottomToasts.map(toast => (
          <ToastItem key={toast.id} {...toast} />
        ))}
      </View>
    </>
  );
};

/**
 * Item de toast individual
 */
const ToastItem: React.FC<ToastState> = ({ message, type = 'info' }) => {
  const { theme } = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getTypeStyles = (): { bg: string; icon: string } => {
    switch (type) {
      case 'success':
        // Usar action.primary para success ya que no hay success en el palette
        return { bg: theme.colors.action.primary, icon: '✓' };
      case 'error':
        return { bg: theme.colors.status.error, icon: '✕' };
      case 'warning':
        // Usar action.pressed para warning ya que no hay warning en el palette
        return { bg: theme.colors.action.pressed, icon: '⚠' };
      case 'info':
      default:
        // Usar surface.secondary para info ya que no hay info en el palette
        return { bg: theme.colors.surface.secondary, icon: 'ℹ' };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: typeStyles.bg,
          borderRadius: theme.borderRadius.md,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <Text color="onPrimary" style={styles.icon}>
        {typeStyles.icon}
      </Text>
      <Text color="onPrimary" style={styles.message}>
        {message}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  topContainer: {
    top: 60,
  },
  bottomContainer: {
    bottom: 60,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  icon: {
    marginRight: 10,
    fontSize: 16,
  },
  message: {
    flex: 1,
  },
});
