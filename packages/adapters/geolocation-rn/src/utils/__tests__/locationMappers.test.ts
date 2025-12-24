import { mapPositionToLocation, mapErrorToNatifyError } from '../locationMappers';
import { NatifyErrorCode } from '@natify/core';

describe('locationMappers', () => {
  describe('mapPositionToLocation', () => {
    it('should map position with all fields', () => {
      const position = {
        coords: {
          latitude: 40.7128,
          longitude: -74.006,
          altitude: 10.5,
          altitudeAccuracy: 5.0,
          accuracy: 20.0,
          heading: 90.0,
          speed: 5.5,
          verticalAccuracy: 2.0,
        },
        timestamp: 1234567890,
      };

      const location = mapPositionToLocation(position);

      expect(location.latitude).toBe(40.7128);
      expect(location.longitude).toBe(-74.006);
      expect(location.altitude).toBe(10.5);
      expect(location.altitudeAccuracy).toBe(5.0);
      expect(location.accuracy).toBe(20.0);
      expect(location.heading).toBe(90.0);
      expect(location.speed).toBe(5.5);
      expect(location.verticalAccuracy).toBe(2.0);
      expect(location.timestamp).toBe(1234567890);
    });

    it('should handle null values correctly', () => {
      const position = {
        coords: {
          latitude: 40.7128,
          longitude: -74.006,
          altitude: null,
          altitudeAccuracy: null,
          accuracy: 20.0,
          heading: null,
          speed: null,
          verticalAccuracy: null,
        },
        timestamp: 1234567890,
      };

      const location = mapPositionToLocation(position);

      expect(location.altitude).toBeUndefined();
      expect(location.altitudeAccuracy).toBeUndefined();
      expect(location.heading).toBeUndefined();
      expect(location.speed).toBeUndefined();
      expect(location.verticalAccuracy).toBeUndefined();
    });
  });

  describe('mapErrorToNatifyError', () => {
    it('should map PERMISSION_DENIED error', () => {
      const error = {
        code: 1,
        message: 'Permission denied',
      };

      const natifyError = mapErrorToNatifyError(error);

      expect(natifyError.code).toBe(NatifyErrorCode.FORBIDDEN);
      expect(natifyError.message).toBe('Location permission denied');
    });

    it('should map POSITION_UNAVAILABLE error', () => {
      const error = {
        code: 2,
        message: 'Position unavailable',
      };

      const natifyError = mapErrorToNatifyError(error);

      expect(natifyError.code).toBe(NatifyErrorCode.NOT_FOUND);
      expect(natifyError.message).toBe('Location unavailable');
    });

    it('should map TIMEOUT error', () => {
      const error = {
        code: 3,
        message: 'Timeout',
      };

      const natifyError = mapErrorToNatifyError(error);

      expect(natifyError.code).toBe(NatifyErrorCode.TIMEOUT);
      expect(natifyError.message).toBe('Location request timeout');
    });

    it('should map unknown error code', () => {
      const error = {
        code: 999,
        message: 'Unknown error',
      };

      const natifyError = mapErrorToNatifyError(error);

      expect(natifyError.code).toBe(NatifyErrorCode.UNKNOWN);
      expect(natifyError.message).toBe('Unknown location error');
    });
  });
});
