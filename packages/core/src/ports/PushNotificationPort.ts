import { Port } from './Port';

/**
 * Tipo de notificación push
 */
export enum PushNotificationType {
  /**
   * Notificación remota (FCM/APNS)
   */
  Remote = 'remote',
  /**
   * Notificación local programada
   */
  Local = 'local',
}

/**
 * Prioridad de la notificación
 */
export enum PushNotificationPriority {
  /**
   * Mínima prioridad
   */
  Min = 'min',
  /**
   * Baja prioridad
   */
  Low = 'low',
  /**
   * Prioridad por defecto
   */
  Default = 'default',
  /**
   * Alta prioridad
   */
  High = 'high',
  /**
   * Máxima prioridad
   */
  Max = 'max',
}

/**
 * Acción de notificación (botón de acción)
 */
export interface PushNotificationAction {
  /**
   * ID único de la acción
   */
  id: string;
  /**
   * Título del botón
   */
  title: string;
  /**
   * Ícono opcional (Android)
   */
  icon?: string;
  /**
   * Si la acción debe abrir la app automáticamente
   */
  pressAction?: {
    id: string;
  };
}

/**
 * Datos de la notificación
 */
export interface PushNotificationData {
  /**
   * Título de la notificación
   */
  title: string;
  /**
   * Cuerpo/mensaje de la notificación
   */
  body: string;
  /**
   * Datos adicionales (payload personalizado)
   */
  data?: Record<string, unknown>;
  /**
   * Imagen grande (Android)
   */
  largeImageUrl?: string;
  /**
   * Imagen pequeña (Android)
   */
  smallImageUrl?: string;
  /**
   * Sonido de la notificación
   */
  sound?: string;
  /**
   * Prioridad de la notificación
   */
  priority?: PushNotificationPriority;
  /**
   * Acciones de la notificación (botones)
   */
  actions?: PushNotificationAction[];
  /**
   * ID del canal (Android)
   */
  channelId?: string;
  /**
   * Si la notificación debe vibrar
   */
  vibration?: boolean;
  /**
   * Si la notificación debe mostrar un badge (iOS)
   */
  badge?: number;
}

/**
 * Token de registro para push notifications
 */
export interface PushNotificationToken {
  /**
   * Token único del dispositivo
   */
  token: string;
  /**
   * Plataforma (ios/android)
   */
  platform: 'ios' | 'android';
}

/**
 * Listener para eventos de notificación
 */
export type PushNotificationListener = (notification: PushNotificationData) => void;

/**
 * Listener para cuando se presiona una notificación
 */
export type PushNotificationPressListener = (
  notification: PushNotificationData & { actionId?: string },
) => void;

/**
 * Listener para cuando se recibe un token
 */
export type PushNotificationTokenListener = (token: PushNotificationToken) => void;

/**
 * Port para Push Notifications
 *
 * Abstrae la funcionalidad de notificaciones push, permitiendo
 * usar diferentes implementaciones (Notifee, Firebase, etc.)
 */
export interface PushNotificationPort extends Port {
  readonly capability: 'push-notification';

  /**
   * Solicita permisos para mostrar notificaciones
   * @returns true si se concedieron los permisos
   */
  requestPermission(): Promise<boolean>;

  /**
   * Verifica si se tienen permisos para mostrar notificaciones
   * @returns true si se tienen permisos
   */
  hasPermission(): Promise<boolean>;

  /**
   * Obtiene el token de registro del dispositivo
   * @returns Token del dispositivo o null si no está disponible
   */
  getToken(): Promise<PushNotificationToken | null>;

  /**
   * Elimina el token de registro
   */
  deleteToken(): Promise<void>;

  /**
   * Muestra una notificación local
   * @param notification Datos de la notificación
   * @param scheduleId ID opcional para programar la notificación
   * @returns ID de la notificación creada
   */
  displayNotification(notification: PushNotificationData, scheduleId?: string): Promise<string>;

  /**
   * Cancela una notificación programada
   * @param notificationId ID de la notificación a cancelar
   */
  cancelNotification(notificationId: string): Promise<void>;

  /**
   * Cancela todas las notificaciones
   */
  cancelAllNotifications(): Promise<void>;

  /**
   * Obtiene todas las notificaciones programadas
   * @returns Array de IDs de notificaciones
   */
  getScheduledNotifications(): Promise<string[]>;

  /**
   * Registra un listener para cuando se recibe una notificación
   * @param listener Función callback
   * @returns Función para remover el listener
   */
  onNotificationReceived(listener: PushNotificationListener): () => void;

  /**
   * Registra un listener para cuando se presiona una notificación
   * @param listener Función callback
   * @returns Función para remover el listener
   */
  onNotificationPressed(listener: PushNotificationPressListener): () => void;

  /**
   * Registra un listener para cuando se actualiza el token
   * @param listener Función callback
   * @returns Función para remover el listener
   */
  onTokenRefresh(listener: PushNotificationTokenListener): () => void;

  /**
   * Crea un canal de notificación (Android)
   * @param channelId ID único del canal
   * @param channelName Nombre del canal
   * @param options Opciones del canal (sonido, vibración, etc.)
   */
  createChannel?(
    channelId: string,
    channelName: string,
    options?: {
      sound?: string;
      vibration?: boolean;
      importance?: 'low' | 'default' | 'high';
    },
  ): Promise<void>;

  /**
   * Elimina un canal de notificación (Android)
   * @param channelId ID del canal a eliminar
   */
  deleteChannel?(channelId: string): Promise<void>;
}
