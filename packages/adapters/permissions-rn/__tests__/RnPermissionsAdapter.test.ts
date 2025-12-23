const mockCheck = jest.fn();
const mockRequest = jest.fn();
const mockOpenSettings = jest.fn();

jest.mock('react-native-permissions', () => ({
  check: mockCheck,
  request: mockRequest,
  openSettings: mockOpenSettings,
  PERMISSIONS: {
    IOS: {
      CAMERA: 'ios.permission.CAMERA',
      PHOTO_LIBRARY: 'ios.permission.PHOTO_LIBRARY',
      LOCATION_WHEN_IN_USE: 'ios.permission.LOCATION_WHEN_IN_USE',
      REMINDERS: 'ios.permission.REMINDERS',
      MICROPHONE: 'ios.permission.MICROPHONE',
      FACE_ID: 'ios.permission.FACE_ID',
    },
    ANDROID: {
      CAMERA: 'android.permission.CAMERA',
      READ_EXTERNAL_STORAGE: 'android.permission.READ_EXTERNAL_STORAGE',
      ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
      RECORD_AUDIO: 'android.permission.RECORD_AUDIO',
    },
  },
  RESULTS: {
    GRANTED: 'granted',
    DENIED: 'denied',
    BLOCKED: 'blocked',
    UNAVAILABLE: 'unavailable',
    LIMITED: 'limited',
  },
}));

jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
  StyleSheet: {
    create: jest.fn((styles) => styles),
    flatten: jest.fn((style) => style),
  },
}));

import { RnPermissionsAdapter } from '../src';
import { PermissionStatus, NativefyError } from '@nativefy/core';

describe('RnPermissionsAdapter', () => {
  let adapter: RnPermissionsAdapter;

  beforeEach(() => {
    jest.clearAllMocks();
    adapter = new RnPermissionsAdapter();
  });

  describe('capability', () => {
    it('should have correct capability', () => {
      expect(adapter.capability).toBe('permissions');
    });
  });

  describe('check', () => {
    it('should return GRANTED when permission is granted', async () => {
      mockCheck.mockResolvedValue('granted');

      const result = await adapter.check('camera');

      expect(result).toBe(PermissionStatus.GRANTED);
      expect(mockCheck).toHaveBeenCalled();
    });

    it('should return DENIED when permission is denied', async () => {
      mockCheck.mockResolvedValue('denied');

      const result = await adapter.check('camera');

      expect(result).toBe(PermissionStatus.DENIED);
    });

    it('should return BLOCKED when permission is blocked', async () => {
      mockCheck.mockResolvedValue('blocked');

      const result = await adapter.check('camera');

      expect(result).toBe(PermissionStatus.BLOCKED);
    });

    it('should return UNAVAILABLE when permission is unavailable', async () => {
      mockCheck.mockResolvedValue('unavailable');

      const result = await adapter.check('camera');

      expect(result).toBe(PermissionStatus.UNAVAILABLE);
    });

    it('should return GRANTED when permission is limited', async () => {
      mockCheck.mockResolvedValue('limited');

      const result = await adapter.check('camera');

      expect(result).toBe(PermissionStatus.GRANTED);
    });

    it('should throw NativefyError when check fails', async () => {
      const error = new Error('Check failed');
      mockCheck.mockRejectedValue(error);

      await expect(adapter.check('camera')).rejects.toThrow(NativefyError);
      await expect(adapter.check('camera')).rejects.toThrow('Error al verificar permiso: camera');
    });
  });

  describe('request', () => {
    it('should return GRANTED when permission is granted', async () => {
      mockRequest.mockResolvedValue('granted');

      const result = await adapter.request('camera');

      expect(result).toBe(PermissionStatus.GRANTED);
      expect(mockRequest).toHaveBeenCalled();
    });

    it('should return DENIED when permission is denied', async () => {
      mockRequest.mockResolvedValue('denied');

      const result = await adapter.request('camera');

      expect(result).toBe(PermissionStatus.DENIED);
    });

    it('should return BLOCKED when permission is blocked', async () => {
      mockRequest.mockResolvedValue('blocked');

      const result = await adapter.request('camera');

      expect(result).toBe(PermissionStatus.BLOCKED);
    });

    it('should throw NativefyError when request fails', async () => {
      const error = new Error('Request failed');
      mockRequest.mockRejectedValue(error);

      await expect(adapter.request('camera')).rejects.toThrow(NativefyError);
      await expect(adapter.request('camera')).rejects.toThrow('Error al solicitar permiso: camera');
    });
  });

  describe('openSettings', () => {
    it('should open settings successfully', async () => {
      mockOpenSettings.mockResolvedValue(undefined);

      await adapter.openSettings();

      expect(mockOpenSettings).toHaveBeenCalled();
    });

    it('should throw NativefyError when openSettings fails', async () => {
      const error = new Error('Open settings failed');
      mockOpenSettings.mockRejectedValue(error);

      await expect(adapter.openSettings()).rejects.toThrow(NativefyError);
      await expect(adapter.openSettings()).rejects.toThrow('Error al abrir configuración del sistema');
    });
  });

  describe('mapToNativePermission (via check)', () => {
    it('should map camera permission correctly for iOS', async () => {
      mockCheck.mockResolvedValue('granted');

      await adapter.check('camera');

      expect(mockCheck).toHaveBeenCalledWith('ios.permission.CAMERA');
    });

    it('should map photoLibrary permission correctly for iOS', async () => {
      mockCheck.mockResolvedValue('granted');

      await adapter.check('photoLibrary');

      expect(mockCheck).toHaveBeenCalledWith('ios.permission.PHOTO_LIBRARY');
    });

    it('should map location permission correctly for iOS', async () => {
      mockCheck.mockResolvedValue('granted');

      await adapter.check('location');

      expect(mockCheck).toHaveBeenCalledWith('ios.permission.LOCATION_WHEN_IN_USE');
    });

    it('should map microphone permission correctly for iOS', async () => {
      mockCheck.mockResolvedValue('granted');

      await adapter.check('microphone');

      expect(mockCheck).toHaveBeenCalledWith('ios.permission.MICROPHONE');
    });

    it('should map notification permission correctly for iOS', async () => {
      mockCheck.mockResolvedValue('granted');

      await adapter.check('notification');

      expect(mockCheck).toHaveBeenCalledWith('ios.permission.REMINDERS');
    });

    it('should map biometrics permission correctly for iOS', async () => {
      mockCheck.mockResolvedValue('granted');

      await adapter.check('biometrics');

      expect(mockCheck).toHaveBeenCalledWith('ios.permission.FACE_ID');
    });

    it('should throw error for unsupported permission type', async () => {
      // El error se lanza en mapToNativePermission y se captura en check
      await expect(adapter.check('unsupported' as any)).rejects.toThrow(NativefyError);
      await expect(adapter.check('unsupported' as any)).rejects.toThrow(
        'Error al verificar permiso: unsupported',
      );
    });
  });
});

