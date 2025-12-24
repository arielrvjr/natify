import { Port } from './Port';

/**
 * Coordenadas geográficas
 */
export interface Coordinates {
  /** Latitud en grados decimales */
  latitude: number;
  /** Longitud en grados decimales */
  longitude: number;
  /** Altitud en metros (opcional) */
  altitude?: number;
  /** Precisión de la altitud en metros (opcional) */
  altitudeAccuracy?: number;
  /** Precisión horizontal en metros */
  accuracy: number;
  /** Precisión vertical en metros (opcional) */
  verticalAccuracy?: number;
  /** Dirección del movimiento en grados (0-360) (opcional) */
  heading?: number;
  /** Velocidad en m/s (opcional) */
  speed?: number;
}

/**
 * Ubicación con timestamp
 */
export interface Location extends Coordinates {
  /** Timestamp de cuando se obtuvo la ubicación */
  timestamp: number;
}

/**
 * Opciones para obtener ubicación
 */
export interface LocationOptions {
  /** Si usar alta precisión (default: true) */
  enableHighAccuracy?: boolean;
  /** Timeout en milisegundos (default: 15000) */
  timeout?: number;
  /** Edad máxima de la ubicación en caché en milisegundos (default: 0 = siempre obtener nueva) */
  maximumAge?: number;
}

/**
 * Opciones para observar cambios de ubicación
 */
export interface WatchLocationOptions extends LocationOptions {
  /** Distancia mínima en metros para emitir actualización (default: 0 = todas las actualizaciones) */
  distanceFilter?: number;
  /** Intervalo mínimo en milisegundos entre actualizaciones (default: 1000) */
  interval?: number;
}

/**
 * Puerto para operaciones de geolocalización.
 * Incluye obtención de ubicación actual, observación de cambios y utilidades.
 */
export interface GeolocationPort extends Port {
  readonly capability: 'geolocation';

  /**
   * Obtiene la ubicación actual del dispositivo.
   * @param options Opciones de precisión y timeout
   * @returns Ubicación actual
   */
  getCurrentPosition(options?: LocationOptions): Promise<Location>;

  /**
   * Observa cambios en la ubicación del dispositivo.
   * @param callback Función que se ejecuta cada vez que cambia la ubicación
   * @param options Opciones de observación
   * @returns Función para detener la observación
   */
  watchPosition(callback: (location: Location) => void, options?: WatchLocationOptions): () => void;

  /**
   * Verifica si el servicio de ubicación está habilitado en el dispositivo.
   * @returns true si está habilitado, false si no
   */
  isLocationEnabled(): Promise<boolean>;

  /**
   * Calcula la distancia en metros entre dos coordenadas usando la fórmula de Haversine.
   * @param from Coordenadas de origen
   * @param to Coordenadas de destino
   * @returns Distancia en metros
   */
  calculateDistance(from: Coordinates, to: Coordinates): number;

  /**
   * Calcula el bearing (dirección) entre dos coordenadas en grados (0-360).
   * @param from Coordenadas de origen
   * @param to Coordenadas de destino
   * @returns Bearing en grados (0 = Norte, 90 = Este, 180 = Sur, 270 = Oeste)
   */
  calculateBearing(from: Coordinates, to: Coordinates): number;
}
