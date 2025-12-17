import { createModule } from "@nativefy/core";

// Screens
import { ProductListScreen } from "./screens/ProductListScreen";
import { ProductDetailScreen } from "./screens/ProductDetailScreen";

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
    options: { headerShown: false },
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

