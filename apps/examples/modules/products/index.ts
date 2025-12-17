import { createModule } from "@nativefy/core";
import { createTopAppBarHeader } from "@nativefy/ui";
import React from "react";

// Screens
import { ProductListScreen } from "./screens/ProductListScreen";
import { ProductDetailScreen } from "./screens/ProductDetailScreen";

// Components
import { ProductListHeaderActions } from "./components/ProductListHeaderActions";

// UseCases
import { GetProductsUseCase } from "./usecases/GetProductsUseCase";
import { GetProductDetailUseCase } from "./usecases/GetProductDetailUseCase";

/**
 * Módulo de Productos
 */
export const ProductsModule = createModule("products", "Products")
  // Capacidades requeridas
  .requires("http", "storage", "navigation")

  // Pantallas
  .screen({
    name: "ProductList",
    component: ProductListScreen,
    options: createTopAppBarHeader({
      title: "Productos",
      actions: [
        {
          icon: React.createElement(ProductListHeaderActions),
          onPress: () => {
            // El onPress se maneja dentro del Avatar del componente
          },
        },
      ],
    }),
  })
  .screen({
    name: "ProductDetail",
    component: ProductDetailScreen,
    options: {
      title: "Detalle",
    },
    deeplink: {
      path: "product/:productId",
      parse: {
        productId: (id: string) => id, 
      },
    },
  })

  // UseCases - tipos inferidos automáticamente
  .useCase("getProducts", (adapters) =>
    new GetProductsUseCase(adapters.http, adapters.storage)
  )
  .useCase("getProductDetail", (adapters) =>
    new GetProductDetailUseCase(adapters.http)
  )

  // Ruta inicial
  .initialRoute("ProductList")

  .build();

