import React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { Container, Text, Input, Button, Column, Spacer } from '@natify/ui';
import { useRegisterViewModel } from '../viewmodels/useRegisterViewModel';

/**
 * Pantalla de registro
 *
 * Esta pantalla demuestra cómo usar un ViewModel que internamente
 * usa Formik directamente con Yup para validación. La pantalla
 * solo se encarga de renderizar y delegar al ViewModel.
 */
export function RegisterScreen() {
  const { state, actions } = useRegisterViewModel();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Container padding={'md'}>
        <Spacer size="xl" />

        <Column gap="md" justifyContent="center">
          <Text variant="display">Crear Cuenta</Text>
          <Text variant="body" color="textSecondary">
            Completa tus datos para registrarte
          </Text>

          <Spacer size="xl" />

          <Column gap="sm">
            <Input
              label="Nombre completo"
              value={state.name}
              onChangeText={actions.setName}
              placeholder="Ingresa tu nombre"
              autoCorrect={false}
              editable={!state.isLoading}
              error={state.fieldErrors?.name}
              onBlur={actions.handleBlur}
            />

            <Input
              label="Email"
              value={state.email}
              onChangeText={actions.setEmail}
              placeholder="correo@ejemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!state.isLoading}
              error={state.fieldErrors?.email}
              onBlur={actions.handleBlur}
            />

            <Input
              label="Contraseña"
              value={state.password}
              onChangeText={actions.setPassword}
              placeholder="Ingresa tu contraseña"
              secureTextEntry
              editable={!state.isLoading}
              error={state.fieldErrors?.password}
              onBlur={actions.handleBlur}
            />

            <Input
              label="Confirmar contraseña"
              value={state.confirmPassword}
              onChangeText={actions.setConfirmPassword}
              placeholder="Confirma tu contraseña"
              secureTextEntry
              editable={!state.isLoading}
              error={state.fieldErrors?.confirmPassword}
              onBlur={actions.handleBlur}
            />
          </Column>

          <Button
            title="Registrarme"
            onPress={actions.register}
            variant="primary"
            loading={state.isLoading}
            disabled={state.isLoading || !state.isFormValid}
            fullWidth
          />

          <Button
            title="¿Ya tienes cuenta? Inicia sesión"
            onPress={actions.goBack}
            variant="ghost"
            disabled={state.isLoading}
            fullWidth
          />
        </Column>
      </Container>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
