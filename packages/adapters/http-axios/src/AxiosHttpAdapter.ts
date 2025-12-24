import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { HttpClientPort, HttpRequestConfig, HttpResponse } from '@natify/core';
import { handleAxiosError } from './utils/errorHandler';

export class AxiosHttpAdapter implements HttpClientPort {
  readonly capability = 'httpclient';

  private instance: AxiosInstance;

  constructor(
    baseURL?: string,
    config?: AxiosRequestConfig,
    interceptors?: {
      onRequest?: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig;
      onResponseError?: (error: any) => Promise<any>;
    },
  ) {
    this.instance = axios.create({
      baseURL,
      timeout: 10000, // Default 10s
      ...config,
    });
    if (interceptors?.onRequest) {
      this.instance.interceptors.request.use(interceptors.onRequest);
    }

    if (interceptors?.onResponseError) {
      this.instance.interceptors.response.use(response => response, interceptors.onResponseError);
    }
  }

  setHeader(key: string, value: string): void {
    this.instance.defaults.headers.common[key] = value;
  }

  removeHeader(key: string): void {
    delete this.instance.defaults.headers.common[key];
  }

  async get<T>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    try {
      const axiosConfig = this.mapConfig(config);
      const response = await this.instance.get<T>(url, axiosConfig);
      return this.normalizeResponse<T>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async post<T>(url: string, body?: unknown, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    try {
      const axiosConfig = this.mapConfig(config);
      const response = await this.instance.post<T>(url, body, axiosConfig);
      return this.normalizeResponse<T>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async put<T>(url: string, body?: unknown, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    try {
      const axiosConfig = this.mapConfig(config);
      const response = await this.instance.put<T>(url, body, axiosConfig);
      return this.normalizeResponse<T>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async patch<T>(
    url: string,
    body?: unknown,
    config?: HttpRequestConfig,
  ): Promise<HttpResponse<T>> {
    try {
      const axiosConfig = this.mapConfig(config);
      const response = await this.instance.patch<T>(url, body, axiosConfig);
      return this.normalizeResponse<T>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete<T>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>> {
    try {
      const axiosConfig = this.mapConfig(config);
      const response = await this.instance.delete<T>(url, axiosConfig);
      return this.normalizeResponse<T>(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Convierte la configuración genérica del framework a la específica de Axios
   */
  private mapConfig(config?: HttpRequestConfig): AxiosRequestConfig {
    if (!config) return {};
    return {
      headers: config.headers,
      params: config.params,
      timeout: config.timeout,
      signal: config.signal,
    };
  }

  /**
   * Estandariza la respuesta para que la UI no sepa que usamos Axios
   */
  private normalizeResponse<T>(response: AxiosResponse<T>): HttpResponse<T> {
    return {
      data: response.data,
      status: response.status,
      headers: response.headers as Record<string, string>,
      requestUrl: response.config.url,
    };
  }

  private handleError(error: unknown): never {
    return handleAxiosError(error);
  }
}
