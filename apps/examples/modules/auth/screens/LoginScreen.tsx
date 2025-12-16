import React from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Input, Button, Column, Spacer, Container } from '@nativefy/ui';
import { useLoginViewModel } from '../viewmodels/useLoginViewModel';

export function LoginScreen() {
  const { state, actions } = useLoginViewModel();
  return (
    <SafeAreaView
      style={{ flex: 1, flexDirection: 'column', flexGrow: 1 }}
      edges={['top', 'bottom']}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
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
                error={state.error?.message}
              />

              <Input
                label="Contraseña"
                value={state.password}
                onChangeText={actions.setPassword}
                placeholder="Ingresa tu contraseña"
                secureTextEntry
                editable={!state.isLoading}
              />

              <Button
                title="Iniciar Sesión"
                onPress={actions.login}
                variant="primary"
                loading={state.isLoading}
                disabled={state.isLoading}
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
