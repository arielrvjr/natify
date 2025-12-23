import Geolocation from '@react-native-community/geolocation';
import {
  GeolocationPort,
  Location,
  LocationOptions,
  WatchLocationOptions,
  Coordinates,
  NativefyError,
  NativefyErrorCode,
} from '@nativefy/core';

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
 * import { RnGeolocationAdapter } from '@nativefy-adapter/geolocation-rn';
 *
 * const geolocationAdapter = new RnGeolocationAdapter();
 *
 * // En NativefyProvider
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
          resolve(this.mapPositionToLocation(position));
        },
        (error) => {
          reject(this.mapErrorToNativefyError(error));
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
        callback(this.mapPositionToLocation(position));
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
    const dLat = this.toRadians(to.latitude - from.latitude);
    const dLon = this.toRadians(to.longitude - from.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(from.latitude)) *
        Math.cos(this.toRadians(to.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Calcula el bearing (dirección) entre dos coordenadas en grados
   */
  calculateBearing(from: Coordinates, to: Coordinates): number {
    const dLon = this.toRadians(to.longitude - from.longitude);
    const lat1 = this.toRadians(from.latitude);
    const lat2 = this.toRadians(to.latitude);

    const y = Math.sin(dLon) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

    let bearing = Math.atan2(y, x);
    bearing = this.toDegrees(bearing);
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

  /**
   * Convierte un Position de Geolocation a Location del framework
   */
  private mapPositionToLocation(position: {
    coords: {
      latitude: number;
      longitude: number;
      altitude?: number | null;
      altitudeAccuracy?: number | null;
      accuracy: number;
      heading?: number | null;
      speed?: number | null;
      verticalAccuracy?: number | null;
    };
    timestamp: number;
  }): Location {
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      altitude: position.coords.altitude ?? undefined,
      altitudeAccuracy: position.coords.altitudeAccuracy ?? undefined,
      accuracy: position.coords.accuracy,
      verticalAccuracy: position.coords.verticalAccuracy ?? undefined,
      heading: position.coords.heading ?? undefined,
      speed: position.coords.speed ?? undefined,
      timestamp: position.timestamp,
    };
  }

  /**
   * Convierte errores de Geolocation a NativefyError
   */
  private mapErrorToNativefyError(error: {
    code: number;
    message: string;
    PERMISSION_DENIED?: number;
    POSITION_UNAVAILABLE?: number;
    TIMEOUT?: number;
  }): NativefyError {
    let code = NativefyErrorCode.UNKNOWN;
    let message = 'Unknown location error';

    switch (error.code) {
      case 1: // PERMISSION_DENIED
        code = NativefyErrorCode.FORBIDDEN;
        message = 'Location permission denied';
        break;
      case 2: // POSITION_UNAVAILABLE
        code = NativefyErrorCode.NOT_FOUND;
        message = 'Location unavailable';
        break;
      case 3: // TIMEOUT
        code = NativefyErrorCode.TIMEOUT;
        message = 'Location request timeout';
        break;
    }

    return new NativefyError(code, message, error, {
      code: error.code,
      message: error.message,
    });
  }

  /**
   * Convierte grados a radianes
   */
  private toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  /**
   * Convierte radianes a grados
   */
  private toDegrees(radians: number): number {
    return (radians * 180) / Math.PI;
  }
}

