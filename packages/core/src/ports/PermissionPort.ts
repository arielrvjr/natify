import { Port } from './Port';

export type PermissionType =
  | 'camera'
  | 'photoLibrary'
  | 'location'
  | 'notification'
  | 'microphone'
  | 'biometrics';

export enum PermissionStatus {
  GRANTED = 'granted',
  DENIED = 'denied', // Se puede volver a pedir
  BLOCKED = 'blocked', // El usuario dijo "No preguntar más" (Requiere ir a settings)
  UNAVAILABLE = 'unavailable', // El hardware no existe
}

export interface PermissionPort extends Port {
  readonly capability: 'permissions';
  check(permission: PermissionType): Promise<PermissionStatus>;
  request(permission: PermissionType): Promise<PermissionStatus>;
  openSettings(): Promise<void>;
}
