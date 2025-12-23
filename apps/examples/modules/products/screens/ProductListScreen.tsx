import React from 'react';
import { FlatList, Image, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Container,
  Text,
  Card,
  Badge,
  Row,
  Column,
  Loading,
  EmptyState,
} from '@nativefy/ui';
import { useProductListViewModel } from '../viewmodels/useProductListViewModel';
import { Product } from '../usecases/GetProductsUseCase';

export function ProductListScreen() {
  const { state, actions } = useProductListViewModel();

  const renderProduct = ({ item }: { item: Product }) => (
    <Card
      variant="elevated"
      onPress={() => actions.goToDetail(item)}
      style={styles.productCard}
    >
      <Row gap="sm" alignItems="center">
        <Image source={{ uri: item.image }} style={styles.productImage} />
        <Column gap="xs" style={styles.productInfo}>
          <Text variant="body" numberOfLines={2}>
            {item.title}
          </Text>
          <Text variant="caption" color="secondary" style={styles.categoryText}>
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
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <Container centered>
          <Loading size="large" message="Cargando productos..." />
        </Container>
      </SafeAreaView>
    );
  }

  if (state.error && state.products.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Container padding={'md'}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  productCard: {
    marginBottom: 16,
  },
  productImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  productInfo: {
    flex: 1,
  },
  categoryText: {
    textTransform: 'capitalize',
  },
});
