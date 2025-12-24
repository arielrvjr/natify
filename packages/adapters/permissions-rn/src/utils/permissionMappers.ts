import { Platform } from 'react-native';
import { PERMISSIONS, RESULTS, Permission } from 'react-native-permissions';
import type { PermissionType } from '@natify/core';
import { PermissionStatus, NatifyError, NatifyErrorCode } from '@natify/core';

/**
 * Mapea los tipos de permiso genéricos del framework a los permisos
 * específicos de cada plataforma.
 */
export function mapToNativePermission(permission: PermissionType): Permission {
  const isIOS = Platform.OS === 'ios';

  switch (permission) {
    case 'camera':
      return isIOS ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;

    case 'photoLibrary':
      return isIOS ? PERMISSIONS.IOS.PHOTO_LIBRARY : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;

    case 'location':
      return isIOS
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

    case 'notification':
      // iOS maneja notificaciones diferente, usamos REMINDERS como fallback
      // En producción, usa notifee o similar para notificaciones push
      // Android < 13 usa READ_EXTERNAL_STORAGE como placeholder
      return isIOS ? PERMISSIONS.IOS.REMINDERS : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;

    case 'microphone':
      return isIOS ? PERMISSIONS.IOS.MICROPHONE : PERMISSIONS.ANDROID.RECORD_AUDIO;

    case 'biometrics':
      // Biometrics en iOS requiere FACE_ID configurado en Info.plist
      // En Android, biometrics se maneja diferente (no es un permiso runtime)
      return isIOS ? PERMISSIONS.IOS.FACE_ID : PERMISSIONS.ANDROID.CAMERA;

    default:
      throw new NatifyError(
        NatifyErrorCode.VALIDATION_ERROR,
        `Tipo de permiso no soportado: ${permission}`,
        undefined,
        { permission },
      );
  }
}

/**
 * Convierte el resultado de react-native-permissions al enum del framework.
 */
export function mapResultToStatus(result: string): PermissionStatus {
  const resultMap: Record<string, PermissionStatus> = {
    [RESULTS.GRANTED]: PermissionStatus.GRANTED,
    [RESULTS.LIMITED]: PermissionStatus.GRANTED,
    [RESULTS.DENIED]: PermissionStatus.DENIED,
    [RESULTS.BLOCKED]: PermissionStatus.BLOCKED,
    [RESULTS.UNAVAILABLE]: PermissionStatus.UNAVAILABLE,
  };

  return resultMap[result] ?? PermissionStatus.DENIED;
}
