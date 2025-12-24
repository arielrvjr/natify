import './setup';

import { mapToNativePermission, mapResultToStatus } from '../permissionMappers';
import type { PermissionType } from '@natify/core';
import { PermissionStatus } from '@natify/core';
import { PERMISSIONS, RESULTS } from 'react-native-permissions';
import { Platform } from 'react-native';

describe('permissionMappers', () => {
  describe('mapToNativePermission', () => {
    it('should map camera permission for iOS', () => {
      (Platform as any).OS = 'ios';
      const permission = mapToNativePermission('camera');
      expect(permission).toBe(PERMISSIONS.IOS.CAMERA);
    });

    it('should map camera permission for Android', () => {
      (Platform as any).OS = 'android';
      const permission = mapToNativePermission('camera');
      expect(permission).toBe(PERMISSIONS.ANDROID.CAMERA);
    });

    it('should map all permission types', () => {
      (Platform as any).OS = 'ios';
      expect(mapToNativePermission('photoLibrary')).toBe(PERMISSIONS.IOS.PHOTO_LIBRARY);
      expect(mapToNativePermission('location')).toBe(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      expect(mapToNativePermission('microphone')).toBe(PERMISSIONS.IOS.MICROPHONE);
    });

    it('should throw error for unsupported permission type', () => {
      expect(() => {
        mapToNativePermission('unsupported' as PermissionType);
      }).toThrow();
    });
  });

  describe('mapResultToStatus', () => {
    it('should map GRANTED to GRANTED', () => {
      expect(mapResultToStatus(RESULTS.GRANTED)).toBe(PermissionStatus.GRANTED);
    });

    it('should map LIMITED to GRANTED', () => {
      expect(mapResultToStatus(RESULTS.LIMITED)).toBe(PermissionStatus.GRANTED);
    });

    it('should map DENIED to DENIED', () => {
      expect(mapResultToStatus(RESULTS.DENIED)).toBe(PermissionStatus.DENIED);
    });

    it('should map BLOCKED to BLOCKED', () => {
      expect(mapResultToStatus(RESULTS.BLOCKED)).toBe(PermissionStatus.BLOCKED);
    });

    it('should map UNAVAILABLE to UNAVAILABLE', () => {
      expect(mapResultToStatus(RESULTS.UNAVAILABLE)).toBe(PermissionStatus.UNAVAILABLE);
    });

    it('should return DENIED for unknown result', () => {
      expect(mapResultToStatus('unknown')).toBe(PermissionStatus.DENIED);
    });
  });
});
