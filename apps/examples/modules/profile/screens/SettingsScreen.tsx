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
  Icon,
} from '@nativefy/ui';
import { useSettingsViewModel } from '../viewmodels/useSettingsViewModel';

export function SettingsScreen() {
  const { state, actions } = useSettingsViewModel();

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
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
              <Card variant="elevated" padding="md">
                <Row alignItems="center" justifyContent="space-between" padding>
                  <Row
                    alignItems="center"
                    gap="md"
                    style={{ flex: 1, marginRight: 12 }}
                  >
                    <Icon name="Bell" size={20} color="primary" />
                    <Column gap="xs" style={{ flex: 1 }}>
                      <Text variant="body">Notificaciones</Text>
                      <Text
                        variant="caption"
                        color="secondary"
                        numberOfLines={2}
                      >
                        Recibir alertas de ofertas y pedidos
                      </Text>
                    </Column>
                  </Row>
                  <Switch
                    value={state.settings.notifications}
                    onChange={actions.toggleNotifications}
                  />
                </Row>
                <Divider />
                <Row
                  alignItems="center"
                  justifyContent="space-between"
                  padding="md"
                >
                  <Row
                    alignItems="center"
                    gap="md"
                    style={{ flex: 1, marginRight: 12 }}
                  >
                    <Icon name="Moon" size={20} color="primary" />
                    <Column gap="xs" style={{ flex: 1 }}>
                      <Text variant="body">Modo Oscuro</Text>
                      <Text
                        variant="caption"
                        color="secondary"
                        numberOfLines={2}
                      >
                        Cambiar apariencia de la app
                      </Text>
                    </Column>
                  </Row>
                  <Switch
                    value={state.settings.darkMode}
                    onChange={actions.toggleDarkMode}
                  />
                </Row>
                <Divider />
                <Row
                  alignItems="center"
                  justifyContent="space-between"
                  padding="md"
                >
                  <Row
                    alignItems="center"
                    gap="md"
                    style={{ flex: 1, marginRight: 12 }}
                  >
                    <Icon name="Shield" size={20} color="primary" />
                    <Column gap="xs" style={{ flex: 1 }}>
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
                  </Row>
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
              <Card variant="elevated" padding="md">
                <Row
                  alignItems="center"
                  justifyContent="space-between"
                  padding="md"
                >
                  <Row
                    alignItems="center"
                    gap="md"
                    style={{ flex: 1, marginRight: 12 }}
                  >
                    <Icon name="Camera" size={20} color="primary" />
                    <Column gap="xs" style={{ flex: 1 }}>
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
                  </Row>
                  <Button
                    title="Solicitar"
                    onPress={actions.requestCameraPermission}
                    variant="secondary"
                  />
                </Row>
                <Divider />
                <Row
                  alignItems="center"
                  justifyContent="space-between"
                  padding="md"
                >
                  <Row
                    alignItems="center"
                    gap="md"
                    style={{ flex: 1, marginRight: 12 }}
                  >
                    <Icon name="Image" size={20} color="primary" />
                    <Column gap="xs" style={{ flex: 1 }}>
                      <Text variant="body">Galería de Fotos</Text>
                      <Text
                        variant="caption"
                        color="secondary"
                        numberOfLines={2}
                      >
                        Solicitar permiso para acceder a fotos
                      </Text>
                    </Column>
                  </Row>
                  <Button
                    title="Solicitar"
                    onPress={actions.requestPhotoLibraryPermission}
                    variant="secondary"
                  />
                </Row>
                <Divider />
                <Row
                  alignItems="center"
                  justifyContent="space-between"
                  padding="md"
                >
                  <Row
                    alignItems="center"
                    gap="md"
                    style={{ flex: 1, marginRight: 12 }}
                  >
                    <Icon name="ImagePlus" size={20} color="primary" />
                    <Column gap="xs" style={{ flex: 1 }}>
                      <Text variant="body">Seleccionar Imagen</Text>
                      <Text
                        variant="caption"
                        color="secondary"
                        numberOfLines={2}
                      >
                        Probar selector de imágenes
                      </Text>
                    </Column>
                  </Row>
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
                <Row
                  alignItems="center"
                  justifyContent="space-between"
                  padding="md"
                >
                  <Row alignItems="center" gap="md" style={{ flex: 1 }}>
                    <Icon name="Languages" size={20} color="primary" />
                    <Column gap="xs" style={{ flex: 1 }}>
                      <Text variant="body">Español</Text>
                      <Text variant="caption" color="secondary">
                        Idioma actual
                      </Text>
                    </Column>
                  </Row>
                  <Icon name="ChevronRight" size={20} color="tertiary" />
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
                <Row alignItems="center" gap="md">
                  <Icon name="Info" size={20} color="primary" />
                  <Column gap="xs" style={{ flex: 1 }}>
                    <Text variant="body">Versión</Text>
                    <Text variant="caption" color="secondary">
                      1.0.0
                    </Text>
                  </Column>
                </Row>
              </Card>
            </Column>
          </Column>
        </Container>
      </ScrollView>
    </SafeAreaView>
  );
}
