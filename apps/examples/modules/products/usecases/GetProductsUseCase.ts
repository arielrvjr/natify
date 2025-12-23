import { HttpClientPort, StoragePort } from '@nativefy/core';

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
}

/**
 * UseCase para obtener lista de productos
 */
export class GetProductsUseCase {
  private cacheKey = 'products_cache';
  private cacheTTL = 5 * 60 * 1000; // 5 minutos

  constructor(
    private readonly http: HttpClientPort,
    private readonly storage: StoragePort,
  ) {}

  async execute(forceRefresh = false): Promise<Product[]> {
    // Intentar obtener de cache
    if (!forceRefresh) {
      const cached = await this.getFromCache();
      if (cached) {
        return cached;
      }
    }

    // Obtener de API
    const response = await this.http.get<Product[]>(
      'https://fakestoreapi.com/products?limit=10',
    );

    // Guardar en cache
    await this.saveToCache(response.data);

    return response.data;
  }

  private async getFromCache(): Promise<Product[] | null> {
    const cached = await this.storage.getItem<{
      data: Product[];
      timestamp: number;
    }>(this.cacheKey);

    if (!cached) return null;

    // Verificar si el cache expiró
    if (Date.now() - cached.timestamp > this.cacheTTL) {
      return null;
    }

    return cached.data;
  }

  private async saveToCache(data: Product[]): Promise<void> {
    await this.storage.setItem(this.cacheKey, {
      data,
      timestamp: Date.now(),
    });
  }
}
