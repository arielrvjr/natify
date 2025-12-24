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
  NatifyError,
  NatifyErrorCode,
} from '@natify/core';
import { mapToNativePermission, mapResultToStatus } from './utils/permissionMappers';

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
      const nativePermission = mapToNativePermission(permission);
      const result = await check(nativePermission);
      return mapResultToStatus(result);
    } catch (error) {
      throw new NatifyError(
        NatifyErrorCode.UNKNOWN,
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
      const nativePermission = mapToNativePermission(permission);
      const result = await request(nativePermission);
      return mapResultToStatus(result);
    } catch (error) {
      throw new NatifyError(
        NatifyErrorCode.UNKNOWN,
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
      throw new NatifyError(
        NatifyErrorCode.UNKNOWN,
        'Error al abrir configuración del sistema',
        error,
      );
    }
  }

}

