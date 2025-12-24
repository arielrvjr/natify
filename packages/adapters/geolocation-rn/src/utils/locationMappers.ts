import type { Location } from '@natify/core';
import { NatifyError, NatifyErrorCode } from '@natify/core';

/**
 * Convierte un Position de Geolocation a Location del framework
 */
export function mapPositionToLocation(position: {
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
 * Convierte errores de Geolocation a NatifyError
 */
export function mapErrorToNatifyError(error: {
  code: number;
  message: string;
  PERMISSION_DENIED?: number;
  POSITION_UNAVAILABLE?: number;
  TIMEOUT?: number;
}): NatifyError {
  const errorMap: Record<number, { code: NatifyErrorCode; message: string }> = {
    1: { code: NatifyErrorCode.FORBIDDEN, message: 'Location permission denied' }, // PERMISSION_DENIED
    2: { code: NatifyErrorCode.NOT_FOUND, message: 'Location unavailable' }, // POSITION_UNAVAILABLE
    3: { code: NatifyErrorCode.TIMEOUT, message: 'Location request timeout' }, // TIMEOUT
  };

  const errorInfo = errorMap[error.code] ?? {
    code: NatifyErrorCode.UNKNOWN,
    message: 'Unknown location error',
  };

  return new NatifyError(errorInfo.code, errorInfo.message, error, {
    code: error.code,
    message: error.message,
  });
}

