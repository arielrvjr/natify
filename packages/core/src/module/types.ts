import { ComponentType } from 'react';
import { Port } from '../ports/Port';
import { HttpClientPort } from '../ports/HttpClientPort';
import { StoragePort } from '../ports/StoragePort';
import { BiometricPort } from '../ports/BiometricPort';
import { PermissionPort } from '../ports/PermissionPort';
import { NavigationPort } from '../ports/NavigationPort';
import { AnalyticsPort } from '../ports/AnalyticsPort';
import { LoggerPort } from '../ports/LoggerPort';
import { ImagePickerPort } from '../ports/ImagePickerPort';
import { ValidationPort } from '../ports/ValidationPort';
import { PushNotificationPort } from '../ports/PushNotificationPort';

/**
 * Mapa de capacidades a sus tipos de Port correspondientes
 */
export interface CapabilityPortMap {
  http: HttpClientPort;
  storage: StoragePort;
  secureStorage: StoragePort;
  biometrics: BiometricPort;
  permissions: PermissionPort;
  navigation: NavigationPort;
  analytics: AnalyticsPort;
  logger: LoggerPort;
  imagePicker: ImagePickerPort;
  validation: ValidationPort;
  pushNotification: PushNotificationPort;
  [key: string]: Port;
}

/**
 * Capacidades requeridas por un módulo
 */
export type RequiredCapability = keyof CapabilityPortMap & string;

/**
 * Mapa de adapters tipado según las capacidades requeridas
 */
export type TypedAdapterMap<T extends RequiredCapability[]> = {
  [K in T[number]]: CapabilityPortMap[K];
};

/**
 * Mapa de adapters genérico (para compatibilidad)
 */
export type AdapterMap = Record<string, Port>;

/**
 * Configuración de deeplink para una pantalla
 */
export interface ScreenDeeplinkConfig {
  /**
   * Path de la URL para esta pantalla
   * Ejemplo: "login", "product/:productId", "user/:userId"
   * Si no se proporciona, se genera automáticamente desde el nombre
   */
  path?: string;

  /**
   * Función para parsear parámetros de la URL
   * Ejemplo: { productId: Number, userId: (id: string) => id.toUpperCase() }
   */
  parse?: Record<string, ((value: string) => unknown) | unknown>;

  /**
   * Función para convertir parámetros a string para la URL
   * Ejemplo: { productId: (id: number) => String(id) }
   */
  stringify?: Record<string, (value: unknown) => string>;
}

/**
 * Definición de una pantalla dentro del módulo
 */
export interface ScreenDefinition {
  /**
   * Nombre de la pantalla (usado para navegación)
   */
  name: string;

  /**
   * Componente React de la pantalla
   */
  component: ComponentType<any>;

  /**
   * Opciones de navegación
   */
  options?: {
    title?: string;
    headerShown?: boolean;
    headerBackTitle?: string;
    gestureEnabled?: boolean;
    animation?: 'default' | 'fade' | 'slide_from_right' | 'slide_from_bottom' | 'none';
    [key: string]: unknown;
  };

  /**
   * Configuración de deeplink para esta pantalla (opcional)
   * Si no se proporciona, se genera automáticamente desde el nombre
   */
  deeplink?: ScreenDeeplinkConfig;
}

/**
 * Definición de un UseCase dentro del módulo
 */
export interface UseCaseDefinition<
  T = unknown,
  C extends RequiredCapability[] = RequiredCapability[],
> {
  /**
   * Key única del UseCase (ej: 'login', 'getProducts')
   */
  key: string;

  /**
   * Factory que crea el UseCase con los adapters necesarios
   */
  factory: (adapters: TypedAdapterMap<C>) => T;
}

/**
 * Definición completa de un módulo
 */
export interface ModuleDefinition<C extends RequiredCapability[] = RequiredCapability[]> {
  /**
   * Identificador único del módulo
   */
  id: string;

  /**
   * Nombre legible del módulo
   */
  name: string;

  /**
   * Capacidades (adapters) que este módulo necesita
   */
  requires: C;

  /**
   * Pantallas del módulo
   */
  screens: ScreenDefinition[];

  /**
   * Ruta inicial del módulo
   */
  initialRoute: string;

  /**
   * UseCases del módulo
   */
  useCases: UseCaseDefinition<unknown, C>[];

  /**
   * Función de inicialización (opcional)
   * Se ejecuta cuando el módulo se carga
   */
  onInit?: (adapters: TypedAdapterMap<C>) => Promise<void> | void;

  /**
   * Función de cleanup (opcional)
   * Se ejecuta cuando el módulo se descarga
   */
  onDestroy?: () => Promise<void> | void;
}

/**
 * Módulo registrado con sus dependencias resueltas
 */
export interface RegisteredModule extends ModuleDefinition {
  /**
   * Adapters resueltos para este módulo
   */
  adapters: AdapterMap;

  /**
   * Estado de carga del módulo
   */
  isLoaded: boolean;
}
