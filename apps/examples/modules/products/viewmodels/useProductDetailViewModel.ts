import { useState, useCallback, useEffect } from "react";
import {
  useBaseViewModel,
  useUseCase,
  useAdapter,
  NavigationPort,
  useNavigationParams,
} from "@nativefy/core";
import { GetProductDetailUseCase } from "../usecases/GetProductDetailUseCase";
import { Product } from "../usecases/GetProductsUseCase";

interface RouteParams {
  productId: number;
  title: string;
}

export function useProductDetailViewModel() {
  const [baseState, { execute }] = useBaseViewModel();
  const [product, setProduct] = useState<Product | null>(null);

  // Usar el helper del core en lugar de useRoute() directamente
  const params = useNavigationParams<RouteParams>();

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

