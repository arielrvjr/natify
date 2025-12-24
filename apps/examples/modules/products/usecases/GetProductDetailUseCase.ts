import { HttpClientPort } from "@natify/core";
import { Product } from "./GetProductsUseCase";

/**
 * UseCase para obtener detalle de un producto
 */
export class GetProductDetailUseCase {
  constructor(private readonly http: HttpClientPort) {}

  async execute(productId: number): Promise<Product> {
    const response = await this.http.get<Product>(
      `https://fakestoreapi.com/products/${productId}`
    );

    return response.data;
  }
}

