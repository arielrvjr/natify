import React from 'react';
import { ScrollView, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Container,
  Text,
  Button,
  Badge,
  Row,
  Column,
  Spacer,
  Loading,
  EmptyState,
} from '@natify/ui';
import { useProductDetailViewModel } from '../viewmodels/useProductDetailViewModel';

export function ProductDetailScreen() {
  const { state, actions } = useProductDetailViewModel();

  if (state.isLoading || !state.product) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <Container centered>
          <Loading size="large" />
        </Container>
      </SafeAreaView>
    );
  }

  if (state.error) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <Container centered>
          <EmptyState
            title="Error"
            description={state.error.message}
            actionLabel="Reintentar"
            onAction={actions.loadProduct}
          />
        </Container>
      </SafeAreaView>
    );
  }

  const { product } = state;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView>
        <Image
          source={{ uri: product.image }}
          style={styles.productImage}
        />

        <Container padding>
          <Column gap="sm">
            <Text variant="caption" color="textSecondary">
              {product.category}
            </Text>
            <Text variant="heading">{product.title}</Text>

            <Row alignItems="center" gap="sm">
              <Badge variant="warning">{`⭐ ${product.rating.rate}`}</Badge>
              <Text variant="body" color="textSecondary">
                ({product.rating.count} reviews)
              </Text>
            </Row>

            <Text variant="display" color="textPrimary">
              ${product.price.toFixed(2)}
            </Text>
            <Spacer size="sm" />

            <Text variant="heading">Descripción</Text>
            <Text variant="body" color="textSecondary">
              {product.description}
            </Text>

            <Spacer size="xl" />

            <Button
              title="Agregar al Carrito"
              onPress={() => { }}
              variant="primary"
              fullWidth
            />
          </Column>
        </Container>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  productImage: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
  },
});
