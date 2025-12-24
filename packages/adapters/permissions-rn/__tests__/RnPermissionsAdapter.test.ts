// Import setup first to ensure mocks are in place
import './setup';

import { check, request, openSettings } from 'react-native-permissions';
import { RnPermissionsAdapter } from '../src';
import { PermissionStatus, NatifyError } from '@natify/core';

// Get the mocked functions
const mockCheck = check as jest.MockedFunction<typeof check>;
const mockRequest = request as jest.MockedFunction<typeof request>;
const mockOpenSettings = openSettings as jest.MockedFunction<typeof openSettings>;

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

    it('should throw NatifyError when check fails', async () => {
      const error = new Error('Check failed');
      mockCheck.mockRejectedValue(error);

      await expect(adapter.check('camera')).rejects.toThrow(NatifyError);
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

    it('should throw NatifyError when request fails', async () => {
      const error = new Error('Request failed');
      mockRequest.mockRejectedValue(error);

      await expect(adapter.request('camera')).rejects.toThrow(NatifyError);
      await expect(adapter.request('camera')).rejects.toThrow('Error al solicitar permiso: camera');
    });
  });

  describe('openSettings', () => {
    it('should open settings successfully', async () => {
      mockOpenSettings.mockResolvedValue(undefined);

      await adapter.openSettings();

      expect(mockOpenSettings).toHaveBeenCalled();
    });

    it('should throw NatifyError when openSettings fails', async () => {
      const error = new Error('Open settings failed');
      mockOpenSettings.mockRejectedValue(error);

      await expect(adapter.openSettings()).rejects.toThrow(NatifyError);
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
      await expect(adapter.check('unsupported' as any)).rejects.toThrow(NatifyError);
      await expect(adapter.check('unsupported' as any)).rejects.toThrow(
        'Error al verificar permiso: unsupported',
      );
    });

    it('should return DENIED for unknown result status (default case)', async () => {
      // Simular un resultado desconocido que no coincide con ningún case
      mockCheck.mockResolvedValue('unknown-status');

      const result = await adapter.check('camera');

      // Debe retornar DENIED como default case
      expect(result).toBe(PermissionStatus.DENIED);
    });
  });

  describe('Android platform mapping', () => {
    beforeEach(() => {
      // Cambiar a Android
      require('react-native').Platform.OS = 'android';
    });

    afterEach(() => {
      // Volver a iOS
      require('react-native').Platform.OS = 'ios';
    });

    it('should map camera permission correctly for Android', async () => {
      mockCheck.mockResolvedValue('granted');

      await adapter.check('camera');

      expect(mockCheck).toHaveBeenCalledWith('android.permission.CAMERA');
    });

    it('should map photoLibrary permission correctly for Android', async () => {
      mockCheck.mockResolvedValue('granted');

      await adapter.check('photoLibrary');

      expect(mockCheck).toHaveBeenCalledWith('android.permission.READ_EXTERNAL_STORAGE');
    });

    it('should map location permission correctly for Android', async () => {
      mockCheck.mockResolvedValue('granted');

      await adapter.check('location');

      expect(mockCheck).toHaveBeenCalledWith('android.permission.ACCESS_FINE_LOCATION');
    });

    it('should map microphone permission correctly for Android', async () => {
      mockCheck.mockResolvedValue('granted');

      await adapter.check('microphone');

      expect(mockCheck).toHaveBeenCalledWith('android.permission.RECORD_AUDIO');
    });

    it('should map notification permission correctly for Android', async () => {
      mockCheck.mockResolvedValue('granted');

      await adapter.check('notification');

      expect(mockCheck).toHaveBeenCalledWith('android.permission.READ_EXTERNAL_STORAGE');
    });

    it('should map biometrics permission correctly for Android', async () => {
      mockCheck.mockResolvedValue('granted');

      await adapter.check('biometrics');

      expect(mockCheck).toHaveBeenCalledWith('android.permission.CAMERA');
    });
  });
});

