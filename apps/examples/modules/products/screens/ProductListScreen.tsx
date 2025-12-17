import React from 'react';
import { FlatList, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Container,
  Text,
  Card,
  Badge,
  Row,
  Column,
  Spacer,
  Loading,
  EmptyState,
  Avatar,
} from '@nativefy/ui';
import { useProductListViewModel } from '../viewmodels/useProductListViewModel';
import { Product } from '../usecases/GetProductsUseCase';

export function ProductListScreen() {
  const { state, actions } = useProductListViewModel();

  const renderProduct = ({ item }: { item: Product }) => (
    <Card
      variant="elevated"
      onPress={() => actions.goToDetail(item)}
      style={{ marginBottom: 16 }}
    >
      <Row gap="sm" alignItems="center">
        <Image
          source={{ uri: item.image }}
          style={{ width: 80, height: 80, resizeMode: 'contain' }}
        />
        <Column gap="xs" style={{ flex: 1 }}>
          <Text variant="body" numberOfLines={2}>
            {item.title}
          </Text>
          <Text
            variant="caption"
            color="secondary"
            style={{ textTransform: 'capitalize' }}
          >
            {item.category}
          </Text>
          <Row justifyContent="space-between" alignItems="center">
            <Text variant="title" color="primary">
              ${item.price.toFixed(2)}
            </Text>
            <Badge variant="warning">{item.rating.rate.toString()}</Badge>
          </Row>
        </Column>
      </Row>
    </Card>
  );

  if (state.isLoading && state.products.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <Container centered>
          <Loading size="large" message="Cargando productos..." />
        </Container>
      </SafeAreaView>
    );
  }

  if (state.error && state.products.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <Container centered>
          <EmptyState
            title="Error al cargar productos"
            description={state.error.message}
            actionLabel="Reintentar"
            onAction={() => actions.loadProducts(true)}
          />
        </Container>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      <Container padding={'md'}>
        <Row justifyContent="space-between" alignItems="center">
          <Text variant="title">Productos</Text>
          <Avatar name="Usuario" size="md" onPress={actions.goToProfile} />
        </Row>
        <Spacer size="sm" />
        <FlatList
          data={state.products}
          renderItem={renderProduct}
          keyExtractor={item => item.id.toString()}
          refreshControl={
            <RefreshControl
              refreshing={state.isLoading}
              onRefresh={actions.refresh}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title="No hay productos"
              description="No se encontraron productos disponibles"
            />
          }
        />
      </Container>
    </SafeAreaView>
  );
}
