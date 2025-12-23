import { Port } from '../ports/Port';
import { HttpClientPort } from '../ports/HttpClientPort';
import { StoragePort } from '../ports/StoragePort';
import { BiometricPort } from '../ports/BiometricPort';
import { PermissionPort } from '../ports/PermissionPort';
import { NavigationPort } from '../ports/NavigationPort';
import { AnalyticsPort } from '../ports/AnalyticsPort';
import { LoggerPort } from '../ports/LoggerPort';
import { ImagePickerPort } from '../ports/ImagePickerPort';
import { PushNotificationPort } from '../ports/PushNotificationPort';

/**
 * Mapa de capacidades a sus tipos de Port correspondientes
 *
 * Este tipo define la relación entre los nombres de capacidades (strings)
 * y sus interfaces de Port correspondientes. Se usa para tipado fuerte
 * en el sistema de módulos y en la validación de adapters.
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
  pushNotification: PushNotificationPort;
  [key: string]: Port;
}

/**
 * Capacidades requeridas por un módulo o componente
 *
 * Representa las claves válidas del CapabilityPortMap.
 * Se usa para tipado fuerte en la definición de módulos.
 */
export type RequiredCapability = keyof CapabilityPortMap & string;

/**
 * Mapa de adapters tipado según las capacidades requeridas
 *
 * Este tipo permite crear mapas de adapters con tipado fuerte
 * basado en las capacidades requeridas.
 *
 * @example
 * ```ts
 * type MyAdapters = TypedAdapterMap<['http', 'storage']>;
 * // Resultado: { http: HttpClientPort; storage: StoragePort; }
 * ```
 */
export type TypedAdapterMap<T extends RequiredCapability[]> = {
  [K in T[number]]: CapabilityPortMap[K];
};

/**
 * Mapa de adapters genérico (para compatibilidad)
 *
 * Representa un mapa de adapters donde las claves son strings
 * y los valores son instancias de Port. Se usa en:
 * - NativefyProvider
 * - AdapterRegistry
 * - NativefyApp
 * - Y otros componentes que necesitan trabajar con adapters de forma genérica
 *
 * @example
 * ```ts
 * const adapters: AdapterMap = {
 *   http: new AxiosHttpAdapter('https://api.example.com'),
 *   storage: new MMKVStorageAdapter(),
 *   navigation: createReactNavigationAdapter(),
 * };
 * ```
 */
export type AdapterMap = Record<string, Port>;
