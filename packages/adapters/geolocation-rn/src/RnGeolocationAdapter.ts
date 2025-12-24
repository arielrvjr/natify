import Geolocation from '@react-native-community/geolocation';
import {
  GeolocationPort,
  Location,
  LocationOptions,
  WatchLocationOptions,
  Coordinates,
  NatifyError,
  NatifyErrorCode,
} from '@natify/core';
import { mapPositionToLocation, mapErrorToNatifyError } from './utils/locationMappers';
import { toRadians, toDegrees } from './utils/mathUtils';

/**
 * Adapter de geolocalización para React Native usando @react-native-community/geolocation.
 *
 * Soporta:
 * - Obtención de ubicación actual
 * - Observación de cambios de ubicación
 * - Cálculo de distancia y bearing
 * - Verificación de servicio de ubicación
 *
 * @example
 * ```typescript
 * import { RnGeolocationAdapter } from '@natify/geolocation-rn';
 *
 * const geolocationAdapter = new RnGeolocationAdapter();
 *
 * // En NatifyProvider
 * const config = {
 *   geolocation: geolocationAdapter,
 *   // ... otros adapters
 * };
 * ```
 */
export class RnGeolocationAdapter implements GeolocationPort {
  readonly capability = 'geolocation';

  private watchIds: Set<number> = new Set();

  constructor() {
    // Configurar opciones globales de Geolocation
    Geolocation.setRNConfiguration({
      skipPermissionRequests: false,
      authorizationLevel: 'whenInUse',
    });
  }

  /**
   * Obtiene la ubicación actual del dispositivo
   */
  async getCurrentPosition(options?: LocationOptions): Promise<Location> {
    return new Promise((resolve, reject) => {
      const defaultOptions: LocationOptions = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
        ...options,
      };

      Geolocation.getCurrentPosition(
        (position) => {
          resolve(mapPositionToLocation(position));
        },
        (error) => {
          reject(mapErrorToNatifyError(error));
        },
        defaultOptions,
      );
    });
  }

  /**
   * Observa cambios en la ubicación del dispositivo
   */
  watchPosition(
    callback: (location: Location) => void,
    options?: WatchLocationOptions,
  ): () => void {
    const defaultOptions: WatchLocationOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
      distanceFilter: 0,
      interval: 1000,
      ...options,
    };

    const watchId = Geolocation.watchPosition(
      (position) => {
        callback(mapPositionToLocation(position));
      },
      (error) => {
        // No rechazar la promesa, solo loguear el error
        console.error('[Location] Watch error:', error);
      },
      defaultOptions,
    );

    this.watchIds.add(watchId);

    // Retornar función para detener la observación
    return () => {
      Geolocation.clearWatch(watchId);
      this.watchIds.delete(watchId);
    };
  }

  /**
   * Verifica si el servicio de ubicación está habilitado
   */
  async isLocationEnabled(): Promise<boolean> {
    return new Promise((resolve) => {
      // Intentar obtener ubicación con timeout corto
      Geolocation.getCurrentPosition(
        () => {
          resolve(true);
        },
        () => {
          resolve(false);
        },
        {
          timeout: 1000,
          maximumAge: Infinity,
        },
      );
    });
  }

  /**
   * Calcula la distancia en metros entre dos coordenadas usando la fórmula de Haversine
   */
  calculateDistance(from: Coordinates, to: Coordinates): number {
    const R = 6371000; // Radio de la Tierra en metros
    const dLat = toRadians(to.latitude - from.latitude);
    const dLon = toRadians(to.longitude - from.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(from.latitude)) *
        Math.cos(toRadians(to.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Calcula el bearing (dirección) entre dos coordenadas en grados
   */
  calculateBearing(from: Coordinates, to: Coordinates): number {
    const dLon = toRadians(to.longitude - from.longitude);
    const lat1 = toRadians(from.latitude);
    const lat2 = toRadians(to.latitude);

    const y = Math.sin(dLon) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

    let bearing = Math.atan2(y, x);
    bearing = toDegrees(bearing);
    bearing = (bearing + 360) % 360;

    return bearing;
  }

  /**
   * Limpia todas las observaciones activas
   */
  clearAllWatchers(): void {
    this.watchIds.forEach((watchId) => {
      Geolocation.clearWatch(watchId);
    });
    this.watchIds.clear();
  }

}

