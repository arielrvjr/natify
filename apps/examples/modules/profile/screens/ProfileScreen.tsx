import React from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Container,
  Text,
  Button,
  Avatar,
  Card,
  Row,
  Column,
  Spacer,
  Loading,
  Divider,
} from '@nativefy/ui';
import { useProfileViewModel } from '../viewmodels/useProfileViewModel';

export function ProfileScreen() {
  const { state, actions } = useProfileViewModel();

  if (state.isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <Container centered>
          <Loading size="large" />
        </Container>
      </SafeAreaView>
    );
  }

  const menuItems = [
    {
      icon: '⚙️',
      title: 'Configuración',
      subtitle: 'Notificaciones, tema, idioma',
      onPress: actions.goToSettings,
    },
    {
      icon: '📦',
      title: 'Mis Pedidos',
      subtitle: 'Historial de compras',
      onPress: () => {},
    },
    {
      icon: '❤️',
      title: 'Favoritos',
      subtitle: 'Productos guardados',
      onPress: () => {},
    },
    {
      icon: '❓',
      title: 'Ayuda',
      subtitle: 'Preguntas frecuentes',
      onPress: () => {},
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      <Container padding={false}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          <Container padding>
            <Button
              title="← Volver"
              onPress={actions.goBack}
              variant="ghost"
              size="sm"
            />
          </Container>

          <Column align="center" gap="md" style={{ paddingVertical: 24 }}>
            <Avatar name={state.user?.name || 'Usuario'} size="xl" />
            <Text variant="h3" weight="bold">
              {state.user?.name || 'Usuario'}
            </Text>
            <Text variant="body" color="textSecondary">
              {state.user?.email || ''}
            </Text>
          </Column>

          <Container padding>
            <Card variant="elevated" padding="none">
              {menuItems.map((item, index) => (
                <React.Fragment key={item.title}>
                  <Card
                    variant="filled"
                    padding="md"
                    onPress={item.onPress}
                    style={{ borderRadius: 0 }}
                  >
                    <Row align="center" justify="between">
                      <Row align="center" gap="md" style={{ flex: 1 }}>
                        <Text style={{ fontSize: 24 }}>{item.icon}</Text>
                        <Column gap="xs" style={{ flex: 1, marginRight: 8 }}>
                          <Text variant="body" weight="medium">
                            {item.title}
                          </Text>
                          <Text
                            variant="caption"
                            color="textSecondary"
                            numberOfLines={2}
                          >
                            {item.subtitle}
                          </Text>
                        </Column>
                      </Row>
                      <Text variant="h4" color="textDisabled">
                        ›
                      </Text>
                    </Row>
                  </Card>
                  {index < menuItems.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </Card>

            <Spacer size="lg" />

            <Button
              title="Cerrar Sesión"
              onPress={actions.logout}
              variant="danger"
              size="lg"
              fullWidth
            />
          </Container>
        </ScrollView>
      </Container>
    </SafeAreaView>
  );
}
