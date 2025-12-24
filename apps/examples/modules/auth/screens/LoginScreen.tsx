import React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Input, Button, Column, Spacer, Container, useTheme } from '@natify/ui';
import { DefaultSplash } from '@natify/core';
import { useLoginViewModel } from '../viewmodels/useLoginViewModel';

export function LoginScreen() {
  const { state, actions } = useLoginViewModel();
  const { theme } = useTheme();

  // Mostrar splash mientras se verifica la autenticación
  if (state.isCheckingAuth) {
    return (
      <DefaultSplash
        message="Verificando sesión..."
        color={theme.colors.action.primary}
        backgroundColor={theme.colors.surface.primary}
      />
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'bottom']}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Container padding={'md'} centered>
          <Column gap="md" justifyContent="center">
            <Text variant="title">Bienvenido</Text>
            <Text variant="body" color="secondary">
              Inicia sesión para continuar
            </Text>

            <Spacer size="xl" />

            <Column gap="sm">
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
                onBlur={actions.handleEmailBlur}
              />

              <Input
                label="Contraseña"
                value={state.password}
                onChangeText={actions.setPassword}
                placeholder="Ingresa tu contraseña"
                secureTextEntry
                editable={!state.isLoading}
                error={state.fieldErrors?.password}
                onBlur={actions.handlePasswordBlur}
              />

              <Button
                title="Iniciar Sesión"
                onPress={actions.login}
                variant="primary"
                loading={state.isLoading}
                disabled={state.isLoading || !state.isFormValid}
                fullWidth
              />

              <Button
                title="¿No tienes cuenta? Regístrate"
                onPress={actions.goToRegister}
                variant="ghost"
                disabled={state.isLoading}
                fullWidth
              />
            </Column>
          </Column>
        </Container>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    flexGrow: 1,
  },
  keyboardView: {
    flex: 1,
  },
});
