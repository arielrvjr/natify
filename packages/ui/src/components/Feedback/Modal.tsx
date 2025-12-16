import React from 'react';
import {
  Modal as RNModal,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../../theme';
import { Text } from '../Text';
import { Button } from '../Button';
import { Row } from '../Layout/Row';

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  closeOnBackdrop?: boolean;
  showCloseButton?: boolean;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
  style?: ViewStyle;
}

/**
 * Componente de modal
 */
export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  closeOnBackdrop = true,
  showCloseButton = true,
  footer,
  size = 'md',
  style,
}) => {
  const { theme } = useTheme();

  const sizeStyles = {
    sm: { width: '70%' as const, maxWidth: 300 },
    md: { width: '85%' as const, maxWidth: 400 },
    lg: { width: '90%' as const, maxWidth: 500 },
    full: { width: '95%' as const, maxHeight: '90%' as const },
  };

  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={closeOnBackdrop ? onClose : undefined}>
        <View style={styles.backdrop}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.content,
                  {
                    backgroundColor: theme.colors.surface.secondary,
                    borderRadius: theme.borderRadius.lg,
                    ...(theme.shadows.lg as ViewStyle),
                  },
                  sizeStyles[size],
                  style,
                ]}
              >
                {(title || showCloseButton) && (
                  <View style={styles.header}>
                    {title && (
                      <Text variant="title" style={styles.title}>
                        {title}
                      </Text>
                    )}
                    {showCloseButton && (
                      <TouchableWithoutFeedback onPress={onClose}>
                        <View style={styles.closeButton}>
                          <Text variant="subtitle" color="secondary">
                            ✕
                          </Text>
                        </View>
                      </TouchableWithoutFeedback>
                    )}
                  </View>
                )}

                <View style={styles.body}>{children}</View>

                {footer && <View style={styles.footer}>{footer}</View>}
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};

/**
 * Modal de confirmación
 */
export interface ConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'ghost';
  loading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmVariant = 'primary',
  loading = false,
}) => {
  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={title}
      showCloseButton={false}
      size="sm"
      footer={
        <Row gap="sm" justify="end">
          <Button title={cancelText} variant="ghost" onPress={onClose} disabled={loading} />
          <Button
            title={confirmText}
            variant={confirmVariant}
            onPress={onConfirm}
            loading={loading}
          />
        </Row>
      }
    >
      <Text color="secondary">{message}</Text>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    width: '100%',
    alignItems: 'center',
  },
  content: {
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  title: {
    flex: 1,
  },
  closeButton: {
    padding: 4,
    marginLeft: 12,
  },
  body: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});
