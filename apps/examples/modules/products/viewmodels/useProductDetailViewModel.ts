import { useState, useCallback, useEffect } from "react";
import {
  useBaseViewModel,
  useUseCase,
  useAdapter,
  NavigationPort,
} from "@nativefy/core";
import { useRoute } from "@react-navigation/native";
import { GetProductDetailUseCase } from "../usecases/GetProductDetailUseCase";
import { Product } from "../usecases/GetProductsUseCase";

interface RouteParams {
  productId: number;
  title: string;
}

export function useProductDetailViewModel() {
  const [baseState, { execute }] = useBaseViewModel();
  const [product, setProduct] = useState<Product | null>(null);

  const route = useRoute();
  const params = route.params as RouteParams;

  const getProductDetailUseCase = useUseCase<GetProductDetailUseCase>(
    "products:getProductDetail"
  );
  const navigation = useAdapter<NavigationPort>("navigation");

  const loadProduct = useCallback(async () => {
    const result = await execute(() =>
      getProductDetailUseCase.execute(params.productId)
    );

    if (result) {
      setProduct(result);
    }
  }, [params.productId, getProductDetailUseCase, execute]);

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Cargar producto al montar
  useEffect(() => {
    loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    state: {
      ...baseState,
      product,
      productId: params.productId,
    },
    actions: {
      loadProduct,
      goBack,
    },
  };
}

