import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
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
} from '@natify/ui';
import { useProfileViewModel } from '../viewmodels/useProfileViewModel';

export function ProfileScreen() {
  const { state, actions } = useProfileViewModel();

  if (state.isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
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
                  style={styles.menuCard}
                >
                  <Row alignItems="center" justifyContent="space-between">
                    <Row alignItems="center" gap="md" style={styles.menuRow}>
                      {item.icon}
                      <Column gap="xs" style={styles.menuColumn}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  menuCard: {
    borderRadius: 0,
  },
  menuRow: {
    flex: 1,
  },
  menuColumn: {
    flex: 1,
    marginRight: 8,
  },
});
