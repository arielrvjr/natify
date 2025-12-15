import React from 'react';
import { ScrollView, Image } from 'react-native';
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
} from '@nativefy/ui';
import { useProductDetailViewModel } from '../viewmodels/useProductDetailViewModel';

export function ProductDetailScreen() {
  const { state, actions } = useProductDetailViewModel();

  if (state.isLoading || !state.product) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <Container centered>
          <Loading size="large" />
        </Container>
      </SafeAreaView>
    );
  }

  if (state.error) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
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
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      <ScrollView>
        <Image
          source={{ uri: product.image }}
          style={{ width: '100%', height: 300, resizeMode: 'contain' }}
        />

        <Container padding>
          <Column gap="md">
            <Text variant="caption" color="textSecondary">
              {product.category}
            </Text>
            <Text variant="h2" weight="bold">
              {product.title}
            </Text>

            <Row align="center" gap="sm">
              <Badge variant="warning" size="md">
                {`⭐ ${product.rating.rate}`}
              </Badge>
              <Text variant="body" color="textSecondary">
                ({product.rating.count} reviews)
              </Text>
            </Row>

            <Text variant="h1" weight="bold" color="primary">
              ${product.price.toFixed(2)}
            </Text>

            <Spacer size="lg" />

            <Text variant="h4" weight="medium">
              Descripción
            </Text>
            <Text
              variant="body"
              color="textSecondary"
              style={{ lineHeight: 24 }}
            >
              {product.description}
            </Text>

            <Spacer size="xl" />

            <Button
              title="Agregar al Carrito"
              onPress={() => {}}
              variant="primary"
              size="lg"
              fullWidth
            />
          </Column>
        </Container>
      </ScrollView>
    </SafeAreaView>
  );
}
