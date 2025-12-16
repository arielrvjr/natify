import React from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Container,
  Text,
  Switch,
  Card,
  Row,
  Column,
  Divider,
  Button,
} from '@nativefy/ui';
import { useSettingsViewModel } from '../viewmodels/useSettingsViewModel';

export function SettingsScreen() {
  const { state, actions } = useSettingsViewModel();

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      <Container padding={false}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          <Container padding>
            <Column gap="xl">
              <Column gap="sm" style={{ marginTop: 0 }}>
                <Text
                  variant="caption"
                  color="secondary"
                  style={{ textTransform: 'uppercase', marginBottom: 8 }}
                >
                  Preferencias
                </Text>
                <Card variant="elevated" padding="none">
                  <Row align="center" justify="between" style={{ padding: 16 }}>
                    <Column gap="xs" style={{ flex: 1, marginRight: 12 }}>
                      <Text variant="body">Notificaciones</Text>
                      <Text
                        variant="caption"
                        color="secondary"
                        numberOfLines={2}
                      >
                        Recibir alertas de ofertas y pedidos
                      </Text>
                    </Column>
                    <Switch
                      value={state.settings.notifications}
                      onChange={actions.toggleNotifications}
                    />
                  </Row>
                  <Divider />
                  <Row align="center" justify="between" style={{ padding: 16 }}>
                    <Column gap="xs" style={{ flex: 1, marginRight: 12 }}>
                      <Text variant="body">Modo Oscuro</Text>
                      <Text
                        variant="caption"
                        color="secondary"
                        numberOfLines={2}
                      >
                        Cambiar apariencia de la app
                      </Text>
                    </Column>
                    <Switch
                      value={state.settings.darkMode}
                      onChange={actions.toggleDarkMode}
                    />
                  </Row>
                  <Divider />
                  <Row align="center" justify="between" style={{ padding: 16 }}>
                    <Column gap="xs" style={{ flex: 1, marginRight: 12 }}>
                      <Text variant="body">Autenticación Biométrica</Text>
                      <Text
                        variant="caption"
                        color="secondary"
                        numberOfLines={2}
                      >
                        {state.biometryAvailable
                          ? `Usar ${state.biometryType} para iniciar sesión`
                          : 'No disponible en este dispositivo'}
                      </Text>
                    </Column>
                    <Switch
                      value={state.settings.biometricsEnabled}
                      onChange={actions.toggleBiometrics}
                      disabled={!state.biometryAvailable}
                    />
                  </Row>
                </Card>
              </Column>

              <Column gap="sm" style={{ marginTop: 24 }}>
                <Text
                  variant="caption"
                  color="secondary"
                  style={{ textTransform: 'uppercase', marginBottom: 8 }}
                >
                  Permisos
                </Text>
                <Card variant="elevated" padding="none">
                  <Row align="center" justify="between" style={{ padding: 16 }}>
                    <Column gap="xs" style={{ flex: 1, marginRight: 12 }}>
                      <Text variant="body">Cámara</Text>
                      <Text
                        variant="caption"
                        color="secondary"
                        numberOfLines={2}
                      >
                        {state.cameraPermissionStatus === 'granted'
                          ? 'Permiso concedido'
                          : 'Solicitar permiso para tomar fotos'}
                      </Text>
                    </Column>
                    <Button
                      title="Solicitar"
                      onPress={actions.requestCameraPermission}
                      variant="secondary"
                    />
                  </Row>
                  <Divider />
                  <Row align="center" justify="between" style={{ padding: 16 }}>
                    <Column gap="xs" style={{ flex: 1, marginRight: 12 }}>
                      <Text variant="body">Galería de Fotos</Text>
                      <Text
                        variant="caption"
                        color="secondary"
                        numberOfLines={2}
                      >
                        Solicitar permiso para acceder a fotos
                      </Text>
                    </Column>
                    <Button
                      title="Solicitar"
                      onPress={actions.requestPhotoLibraryPermission}
                      variant="secondary"
                    />
                  </Row>
                  <Divider />
                  <Row align="center" justify="between" style={{ padding: 16 }}>
                    <Column gap="xs" style={{ flex: 1, marginRight: 12 }}>
                      <Text variant="body">Seleccionar Imagen</Text>
                      <Text
                        variant="caption"
                        color="secondary"
                        numberOfLines={2}
                      >
                        Probar selector de imágenes
                      </Text>
                    </Column>
                    <Button
                      title="Abrir"
                      onPress={actions.pickImage}
                      variant="secondary"
                    />
                  </Row>
                </Card>
              </Column>

              <Column gap="sm" style={{ marginTop: 24 }}>
                <Text
                  variant="caption"
                  color="secondary"
                  style={{ textTransform: 'uppercase', marginBottom: 8 }}
                >
                  Idioma
                </Text>
                <Card variant="elevated" padding="md">
                  <Row align="center" justify="between">
                    <Column gap="xs">
                      <Text variant="body">Español</Text>
                      <Text variant="caption" color="secondary">
                        Idioma actual
                      </Text>
                    </Column>
                    <Text variant="body" color="tertiary">
                      ›
                    </Text>
                  </Row>
                </Card>
              </Column>

              <Column gap="sm" style={{ marginTop: 24 }}>
                <Text
                  variant="caption"
                  color="secondary"
                  style={{ textTransform: 'uppercase', marginBottom: 8 }}
                >
                  Información
                </Text>
                <Card variant="elevated" padding="md">
                  <Column gap="xs">
                    <Text variant="body">Versión</Text>
                    <Text variant="caption" color="secondary">
                      1.0.0
                    </Text>
                  </Column>
                </Card>
              </Column>
            </Column>
          </Container>
        </ScrollView>
      </Container>
    </SafeAreaView>
  );
}
