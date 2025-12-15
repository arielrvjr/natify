import { Port } from './Port';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface HttpRequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
  // Útil para cancelar peticiones en useEffect (AbortController)
  signal?: AbortSignal;
}

export interface HttpResponse<T = any> {
  data: T;
  status: number;
  headers: Record<string, string>;
  requestUrl?: string;
}

export interface HttpClientPort extends Port {
  readonly capability: 'httpclient';
  setHeader(key: string, value: string): void;
  removeHeader(key: string): void;

  // Métodos estándar
  get<T>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>>;
  post<T>(url: string, body?: unknown, config?: HttpRequestConfig): Promise<HttpResponse<T>>;
  put<T>(url: string, body?: unknown, config?: HttpRequestConfig): Promise<HttpResponse<T>>;
  patch<T>(url: string, body?: unknown, config?: HttpRequestConfig): Promise<HttpResponse<T>>;
  delete<T>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>>;
}
