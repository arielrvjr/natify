import { useState, useCallback, useEffect } from "react";
import {
  useBaseViewModel,
  useUseCase,
  useAdapter,
  NavigationPort,
} from "@natify/core";
import { GetProductsUseCase, Product } from "../usecases/GetProductsUseCase";

export function useProductListViewModel() {
  const [baseState, { execute }] = useBaseViewModel();
  const [products, setProducts] = useState<Product[]>([]);

  const getProductsUseCase = useUseCase<GetProductsUseCase>("products:getProducts");
  const navigation = useAdapter<NavigationPort>("navigation");

  const loadProducts = useCallback(
    async (forceRefresh = false) => {
      const result = await execute(() =>
        getProductsUseCase.execute(forceRefresh)
      );

      if (result) {
        setProducts(result);
      }
    },
    [getProductsUseCase, execute]
  );

  const refresh = useCallback(() => {
    loadProducts(true);
  }, [loadProducts]);

  const goToDetail = useCallback(
    (product: Product) => {
      navigation.navigate("products/ProductDetail", {
        productId: product.id,
        title: product.title,
      });
    },
    [navigation]
  );

  const goToProfile = useCallback(() => {
    navigation.navigate("profile/Profile");
  }, [navigation]);

  // Cargar productos al montar
  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    state: {
      ...baseState,
      products,
    },
    actions: {
      loadProducts,
      refresh,
      goToDetail,
      goToProfile,
    },
  };
}

