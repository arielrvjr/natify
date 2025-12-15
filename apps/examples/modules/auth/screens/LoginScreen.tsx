import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Container, Text, Input, Button, Column, Spacer } from '@nativefy/ui';
import { useLoginViewModel } from '../viewmodels/useLoginViewModel';

export function LoginScreen() {
  const { state, actions } = useLoginViewModel();

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Container padding centered>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
            keyboardShouldPersistTaps="handled"
          >
            <Column gap="lg">
              <Text variant="h1" weight="bold">
                Bienvenido
              </Text>
              <Text variant="body" color="textSecondary">
                Inicia sesión para continuar
              </Text>

              <Spacer size="xl" />

              <Column gap="md">
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
                  size="lg"
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
          </ScrollView>
        </Container>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
