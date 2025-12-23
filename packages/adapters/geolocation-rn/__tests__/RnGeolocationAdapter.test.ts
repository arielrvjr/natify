import { RnGeolocationAdapter } from '../src';
import { NativefyError, NativefyErrorCode } from '@nativefy/core';
import Geolocation from '@react-native-community/geolocation';

// Mock @react-native-community/geolocation
const mockGetCurrentPosition = jest.fn();
const mockWatchPosition = jest.fn();
const mockClearWatch = jest.fn();
const mockRequestAuthorization = jest.fn();
const mockStopObserving = jest.fn();
const mockSetRNConfiguration = jest.fn();

jest.mock('@react-native-community/geolocation', () => ({
  getCurrentPosition: (...args: any[]) => mockGetCurrentPosition(...args),
  watchPosition: (...args: any[]) => mockWatchPosition(...args),
  clearWatch: (...args: any[]) => mockClearWatch(...args),
  requestAuthorization: (...args: any[]) => mockRequestAuthorization(...args),
  stopObserving: (...args: any[]) => mockStopObserving(...args),
  setRNConfiguration: (...args: any[]) => mockSetRNConfiguration(...args),
}));

describe('RnGeolocationAdapter', () => {
  let adapter: RnGeolocationAdapter;

  beforeEach(() => {
    jest.clearAllMocks();
    adapter = new RnGeolocationAdapter();
  });

  describe('constructor', () => {
    it('should create adapter and configure Geolocation', () => {
      expect(adapter).toBeDefined();
      expect(adapter.capability).toBe('geolocation');
      expect(mockSetRNConfiguration).toHaveBeenCalledWith({
        skipPermissionRequests: false,
        authorizationLevel: 'whenInUse',
      });
    });
  });

  describe('getCurrentPosition', () => {
    it('should get current position successfully', async () => {
      const mockPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.006,
          altitude: 10,
          accuracy: 20,
          altitudeAccuracy: 5,
          heading: 90,
          speed: 5,
        },
        timestamp: Date.now(),
      };

      mockGetCurrentPosition.mockImplementation((success, error, options) => {
        success(mockPosition);
      });

      const location = await adapter.getCurrentPosition();

      expect(location.latitude).toBe(40.7128);
      expect(location.longitude).toBe(-74.006);
      expect(location.timestamp).toBeDefined();
    });

    it('should use custom options', async () => {
      const mockPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.006,
          accuracy: 20,
        },
        timestamp: Date.now(),
      };

      mockGetCurrentPosition.mockImplementation((success, error, options) => {
        expect(options.enableHighAccuracy).toBe(false);
        expect(options.timeout).toBe(5000);
        success(mockPosition);
      });

      await adapter.getCurrentPosition({
        enableHighAccuracy: false,
        timeout: 5000,
      });
    });

    it('should throw NativefyError on error', async () => {
      const mockError = {
        code: 1,
        message: 'Location permission denied',
      };

      mockGetCurrentPosition.mockImplementation((success, error, options) => {
        error(mockError);
      });

      await expect(adapter.getCurrentPosition()).rejects.toThrow(NativefyError);
    });
  });

  describe('watchPosition', () => {
    it('should watch position and return unsubscribe function', () => {
      const mockWatchId = 123;
      const callback = jest.fn();
      const mockPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.006,
          accuracy: 20,
        },
        timestamp: Date.now(),
      };

      mockWatchPosition.mockImplementation((success, error, options) => {
        success(mockPosition);
        return mockWatchId;
      });

      const unsubscribe = adapter.watchPosition(callback);

      expect(mockWatchPosition).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          latitude: 40.7128,
          longitude: -74.006,
        }),
      );
      expect(unsubscribe).toBeDefined();
    });

    it('should stop watching when unsubscribe is called', () => {
      const mockWatchId = 123;
      const callback = jest.fn();

      mockWatchPosition.mockReturnValue(mockWatchId);

      const unsubscribe = adapter.watchPosition(callback);
      unsubscribe();

      expect(mockClearWatch).toHaveBeenCalledWith(mockWatchId);
    });

    it('should use custom options', () => {
      const callback = jest.fn();
      const mockPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.006,
          accuracy: 20,
        },
        timestamp: Date.now(),
      };

      mockWatchPosition.mockImplementation((success, error, options) => {
        expect(options.distanceFilter).toBe(100);
        expect(options.interval).toBe(5000);
        success(mockPosition);
        return 123;
      });

      adapter.watchPosition(callback, {
        distanceFilter: 100,
        interval: 5000,
      });
    });
  });

  describe('isLocationEnabled', () => {
    it('should return true when location is enabled', async () => {
      // Mock getCurrentPosition to resolve successfully
      mockGetCurrentPosition.mockImplementation((success, error, options) => {
        success({
          coords: {
            latitude: 40.7128,
            longitude: -74.006,
            accuracy: 20,
          },
          timestamp: Date.now(),
        });
      });

      const enabled = await adapter.isLocationEnabled();

      expect(enabled).toBe(true);
    });

    it('should return false when location is disabled', async () => {
      mockGetCurrentPosition.mockImplementation((success, error, options) => {
        error({
          code: 1,
          message: 'Location permission denied',
        });
      });

      const enabled = await adapter.isLocationEnabled();

      expect(enabled).toBe(false);
    });
  });

  describe('calculateDistance', () => {
    it('should calculate distance between two coordinates', () => {
      const from = { latitude: 40.7128, longitude: -74.006, accuracy: 20 };
      const to = { latitude: 40.7589, longitude: -73.9851, accuracy: 20 };

      const distance = adapter.calculateDistance(from, to);

      // Distance between NYC coordinates should be approximately 5-6 km
      expect(distance).toBeGreaterThan(5000);
      expect(distance).toBeLessThan(6000);
    });

    it('should return 0 for same coordinates', () => {
      const coord = { latitude: 40.7128, longitude: -74.006, accuracy: 20 };

      const distance = adapter.calculateDistance(coord, coord);

      expect(distance).toBe(0);
    });
  });

  describe('calculateBearing', () => {
    it('should calculate bearing between two coordinates', () => {
      const from = { latitude: 40.7128, longitude: -74.006, accuracy: 20 };
      const to = { latitude: 40.7589, longitude: -73.9851, accuracy: 20 };

      const bearing = adapter.calculateBearing(from, to);

      // Bearing should be between 0 and 360 degrees
      expect(bearing).toBeGreaterThanOrEqual(0);
      expect(bearing).toBeLessThan(360);
    });

    it('should return 0 for same coordinates', () => {
      const coord = { latitude: 40.7128, longitude: -74.006, accuracy: 20 };

      const bearing = adapter.calculateBearing(coord, coord);

      expect(bearing).toBe(0);
    });
  });
});

