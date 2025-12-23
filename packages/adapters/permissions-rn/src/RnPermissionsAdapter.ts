import { Platform } from 'react-native';
import {
  check,
  request,
  openSettings,
  PERMISSIONS,
  RESULTS,
  Permission,
} from 'react-native-permissions';
import {
  PermissionPort,
  PermissionType,
  PermissionStatus,
  NativefyError,
  NativefyErrorCode,
} from '@nativefy/core';

/**
 * Adapter que implementa PermissionPort usando react-native-permissions.
 * Normaliza las diferencias entre iOS y Android.
 */
export class RnPermissionsAdapter implements PermissionPort {
  readonly capability = 'permissions';

  /**
   * Verifica el estado actual de un permiso sin solicitarlo.
   */
  async check(permission: PermissionType): Promise<PermissionStatus> {
    try {
      const nativePermission = this.mapToNativePermission(permission);
      const result = await check(nativePermission);
      return this.mapResultToStatus(result);
    } catch (error) {
      throw new NativefyError(
        NativefyErrorCode.UNKNOWN,
        `Error al verificar permiso: ${permission}`,
        error,
        { permission },
      );
    }
  }

  /**
   * Solicita un permiso al usuario.
   * Si el permiso ya fue bloqueado, retorna BLOCKED sin mostrar diálogo.
   */
  async request(permission: PermissionType): Promise<PermissionStatus> {
    try {
      const nativePermission = this.mapToNativePermission(permission);
      const result = await request(nativePermission);
      return this.mapResultToStatus(result);
    } catch (error) {
      throw new NativefyError(
        NativefyErrorCode.UNKNOWN,
        `Error al solicitar permiso: ${permission}`,
        error,
        { permission },
      );
    }
  }

  /**
   * Abre la configuración de la aplicación en el sistema.
   * Útil cuando el usuario ha bloqueado un permiso.
   */
  async openSettings(): Promise<void> {
    try {
      await openSettings();
    } catch (error) {
      throw new NativefyError(
        NativefyErrorCode.UNKNOWN,
        'Error al abrir configuración del sistema',
        error,
      );
    }
  }

  /**
   * Mapea los tipos de permiso genéricos del framework a los permisos
   * específicos de cada plataforma.
   */
  private mapToNativePermission(permission: PermissionType): Permission {
    const isIOS = Platform.OS === 'ios';

    // Nota: Algunos permisos no existen en todas las versiones de Android/iOS
    // Para notifications en Android < 13, no se requiere permiso explícito
    // Para biometrics, usamos FACE_ID en iOS (requiere configuración en Info.plist)
    const permissionMap: Record<PermissionType, { ios: Permission; android: Permission }> = {
      camera: {
        ios: PERMISSIONS.IOS.CAMERA,
        android: PERMISSIONS.ANDROID.CAMERA,
      },
      photoLibrary: {
        ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
        android: PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
      },
      location: {
        ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
        android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      },
      notification: {
        // iOS maneja notificaciones diferente, usamos REMINDERS como fallback
        // En producción, usa notifee o similar para notificaciones push
        ios: PERMISSIONS.IOS.REMINDERS,
        android: PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE, // Placeholder para Android < 13
      },
      microphone: {
        ios: PERMISSIONS.IOS.MICROPHONE,
        android: PERMISSIONS.ANDROID.RECORD_AUDIO,
      },
      biometrics: {
        // Biometrics en iOS requiere FACE_ID configurado en Info.plist
        // En Android, biometrics se maneja diferente (no es un permiso runtime)
        ios: PERMISSIONS.IOS.FACE_ID,
        android: PERMISSIONS.ANDROID.CAMERA, // Fallback - biometrics no requiere permiso en Android
      },
    };

    const mapping = permissionMap[permission];
    if (!mapping) {
      throw new NativefyError(
        NativefyErrorCode.VALIDATION_ERROR,
        `Tipo de permiso no soportado: ${permission}`,
        undefined,
        { permission },
      );
    }

    return isIOS ? mapping.ios : mapping.android;
  }

  /**
   * Convierte el resultado de react-native-permissions al enum del framework.
   */
  private mapResultToStatus(result: string): PermissionStatus {
    switch (result) {
      case RESULTS.GRANTED:
      case RESULTS.LIMITED:
        return PermissionStatus.GRANTED;
      case RESULTS.DENIED:
        return PermissionStatus.DENIED;
      case RESULTS.BLOCKED:
        return PermissionStatus.BLOCKED;
      case RESULTS.UNAVAILABLE:
        return PermissionStatus.UNAVAILABLE;
      default:
        return PermissionStatus.DENIED;
    }
  }
}

