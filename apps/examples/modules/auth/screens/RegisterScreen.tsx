import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Container,
  Text,
  Input,
  Button,
  Column,
  Spacer,
} from "@nativefy/ui";
import { useRegisterViewModel } from "../viewmodels/useRegisterViewModel";

export function RegisterScreen() {
  const { state, actions } = useRegisterViewModel();

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Container padding>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
        >
          <Column gap="lg">
            <Text variant="h1" weight="bold">
              Crear Cuenta
            </Text>
            <Text variant="body" color="textSecondary">
              Completa tus datos para registrarte
            </Text>

            <Spacer size="xl" />

            <Column gap="md">
              <Input
                label="Nombre completo"
                value={state.name}
                onChangeText={actions.setName}
                placeholder="Ingresa tu nombre"
                autoCorrect={false}
                editable={!state.isLoading}
                error={state.error?.message}
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
              />

              <Input
                label="Contraseña"
                value={state.password}
                onChangeText={actions.setPassword}
                placeholder="Ingresa tu contraseña"
                secureTextEntry
                editable={!state.isLoading}
              />

              <Input
                label="Confirmar contraseña"
                value={state.confirmPassword}
                onChangeText={actions.setConfirmPassword}
                placeholder="Confirma tu contraseña"
                secureTextEntry
                editable={!state.isLoading}
              />

              <Button
                title="Registrarme"
                onPress={actions.register}
                variant="primary"
                size="lg"
                loading={state.isLoading}
                disabled={state.isLoading}
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
          </Column>
        </ScrollView>
      </Container>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

