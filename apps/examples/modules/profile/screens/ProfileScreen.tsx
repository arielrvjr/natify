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
  Icon,
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
      icon: <Icon name="Settings" size={20} color="primary" />,
      title: 'Configuración',
      subtitle: 'Notificaciones, tema, idioma',
      onPress: actions.goToSettings,
    },
    {
      icon: <Icon name="Package" size={20} color="primary" />,
      title: 'Mis Pedidos',
      subtitle: 'Historial de compras',
      onPress: () => {},
    },
    {
      icon: <Icon name="Heart" size={20} color="primary" />,
      title: 'Favoritos',
      subtitle: 'Productos guardados',
      onPress: () => {},
    },
    {
      icon: <Icon name="Info" size={20} color="primary" />,
      title: 'Ayuda',
      subtitle: 'Preguntas frecuentes',
      onPress: () => {},
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <Container padding>
          <Column alignItems="center" gap="md" paddingVertical="md">
            <Avatar name={state.user?.name || 'Usuario'} size="xl" />
            <Text variant="subtitle">{state.user?.name || 'Usuario'}</Text>
            <Text variant="body" color="secondary">
              {state.user?.email || ''}
            </Text>
          </Column>
        </Container>

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
                  <Row alignItems="center" justifyContent="space-between">
                    <Row alignItems="center" gap="md" style={{ flex: 1 }}>
                      {item.icon}
                      <Column gap="xs" style={{ flex: 1, marginRight: 8 }}>
                        <Text variant="body">{item.title}</Text>
                        <Text
                          variant="caption"
                          color="secondary"
                          numberOfLines={2}
                        >
                          {item.subtitle}
                        </Text>
                      </Column>
                    </Row>
                    <Icon name="ChevronRight" size={20} color="secondary" />
                  </Row>
                </Card>
                {index < menuItems.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </Card>

          <Spacer size="lg" />

          <Button title="Cerrar Sesión" onPress={actions.logout} fullWidth />
        </Container>
      </ScrollView>
    </SafeAreaView>
  );
}
