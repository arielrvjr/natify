import notifee, { AndroidImportance, EventType, TriggerType } from '@notifee/react-native';
import {
  PushNotificationPort,
  PushNotificationData,
  PushNotificationToken,
  PushNotificationListener,
  PushNotificationPressListener,
  PushNotificationTokenListener,
  PushNotificationPriority,
  PushNotificationAction,
  NativefyError,
  NativefyErrorCode,
} from '@nativefy/core';
import { Platform } from 'react-native';

/**
 * Adapter de Push Notifications usando @notifee/react-native
 *
 * Notifee es una librería que permite mostrar notificaciones locales
 * y manejar notificaciones remotas en Android e iOS.
 */
export class NotifeePushAdapter implements PushNotificationPort {
  readonly capability = 'push-notification';

  private notificationListeners: Set<PushNotificationListener> = new Set();
  private pressListeners: Set<PushNotificationPressListener> = new Set();
  private tokenListeners: Set<PushNotificationTokenListener> = new Set();

  constructor() {
    this.setupEventListeners();
  }

  /**
   * Configura los listeners de eventos de Notifee
   */
  private setupEventListeners(): void {
    // Listener para cuando se recibe una notificación
    notifee.onForegroundEvent(({ type, detail }: { type: EventType; detail: any }) => {
      // EventType.PRESS es el único evento que manejamos para notificaciones presionadas
      if (type === EventType.PRESS) {
        const notification = this.mapNotifeeNotificationToData(detail.notification);
        this.pressListeners.forEach(listener =>
          listener({
            ...notification,
            actionId: detail.pressAction?.id,
          }),
        );
      }
      // Notificar cuando se muestra una notificación (usando el evento PRESS también)
      if (detail.notification) {
        const notification = this.mapNotifeeNotificationToData(detail.notification);
        this.notificationListeners.forEach(listener => listener(notification));
      }
    });

    // Listener para cuando se presiona una notificación en background
    notifee.onBackgroundEvent(async ({ type, detail }: { type: EventType; detail: any }) => {
      if (type === EventType.PRESS) {
        const notification = this.mapNotifeeNotificationToData(detail.notification);
        this.pressListeners.forEach(listener =>
          listener({
            ...notification,
            actionId: detail.pressAction?.id,
          }),
        );
      }
    });
  }

  /**
   * Mapea una notificación de Notifee a PushNotificationData
   */
  private mapNotifeeNotificationToData(notif: any): PushNotificationData {
    return {
      title: notif.title || '',
      body: notif.body || '',
      data: notif.data || {},
      largeImageUrl: notif.android?.largeIcon,
      smallImageUrl: notif.android?.smallIcon,
      sound: notif.sound,
      priority: this.mapAndroidImportanceToPriority(notif.android?.importance),
      channelId: notif.android?.channelId,
      vibration: notif.android?.vibrate !== false,
      badge: notif.ios?.badge,
    };
  }

  /**
   * Mapea la importancia de Android a PushNotificationPriority
   */
  private mapAndroidImportanceToPriority(importance?: AndroidImportance): PushNotificationPriority {
    switch (importance) {
      case AndroidImportance.MIN:
        return PushNotificationPriority.Min;
      case AndroidImportance.LOW:
        return PushNotificationPriority.Low;
      case AndroidImportance.HIGH:
        return PushNotificationPriority.High;
      // AndroidImportance.MAX no existe, usar HIGH como máximo
      default:
        return PushNotificationPriority.Default;
    }
  }

  /**
   * Mapea PushNotificationPriority a AndroidImportance
   */
  private mapPriorityToAndroidImportance(priority: PushNotificationPriority): AndroidImportance {
    switch (priority) {
      case PushNotificationPriority.Min:
        return AndroidImportance.MIN;
      case PushNotificationPriority.Low:
        return AndroidImportance.LOW;
      case PushNotificationPriority.High:
        return AndroidImportance.HIGH;
      case PushNotificationPriority.Max:
        // AndroidImportance.MAX no existe, usar HIGH como máximo
        return AndroidImportance.HIGH;
      default:
        return AndroidImportance.DEFAULT;
    }
  }

  async requestPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        const settings = await notifee.requestPermission();
        // AndroidNotificationSetting usa valores numéricos: 1 = AUTHORIZED, 2 = PROVISIONAL
        return (
          settings.authorizationStatus === 1 || // AUTHORIZED
          settings.authorizationStatus === 2 // PROVISIONAL
        );
      } else {
        // iOS
        const settings = await notifee.requestPermission();
        return (
          settings.authorizationStatus === 1 || // AUTHORIZED
          settings.authorizationStatus === 2 // PROVISIONAL
        );
      }
    } catch (error) {
      throw new NativefyError(
        NativefyErrorCode.UNKNOWN,
        'Error al solicitar permisos de notificación',
        error,
      );
    }
  }

  async hasPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        const settings = await notifee.getNotificationSettings();
        // AndroidNotificationSetting usa valores numéricos: 1 = AUTHORIZED, 2 = PROVISIONAL
        return (
          settings.authorizationStatus === 1 || // AUTHORIZED
          settings.authorizationStatus === 2 // PROVISIONAL
        );
      } else {
        // iOS
        const settings = await notifee.getNotificationSettings();
        return settings.authorizationStatus === 1 || settings.authorizationStatus === 2;
      }
    } catch (error) {
      throw new NativefyError(
        NativefyErrorCode.UNKNOWN,
        'Error al verificar permisos de notificación',
        error,
      );
    }
  }

  async getToken(): Promise<PushNotificationToken | null> {
    // Notifee no proporciona tokens FCM/APNS directamente
    // Este método debería ser usado con Firebase o APNS
    // Por ahora retornamos null
    return null;
  }

  async deleteToken(): Promise<void> {
    // Notifee no maneja tokens directamente
    // Este método debería ser usado con Firebase o APNS
  }

  async displayNotification(
    notification: PushNotificationData,
    scheduleId?: string,
  ): Promise<string> {
    try {
      const notifeeNotification: any = {
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        android: {
          channelId: notification.channelId || 'default',
          importance: this.mapPriorityToAndroidImportance(
            notification.priority || PushNotificationPriority.Default,
          ),
          smallIcon: notification.smallImageUrl || 'ic_notification',
          largeIcon: notification.largeImageUrl,
          vibrate: notification.vibration !== false,
          pressAction: {
            id: 'default',
          },
          ...(notification.actions && {
            actions: notification.actions.map((action: PushNotificationAction) => ({
              title: action.title,
              pressAction: {
                id: action.id,
              },
              icon: action.icon,
            })),
          }),
        },
        ios: {
          sound: notification.sound || 'default',
          badge: notification.badge,
        },
      };

      if (scheduleId) {
        // Programar notificación
        // Nota: scheduleId debería contener el timestamp, por ahora usamos un valor por defecto
        const trigger = {
          type: TriggerType.TIMESTAMP as const,
          timestamp: Date.now() + 1000, // 1 segundo en el futuro (debería venir del scheduleId)
        };
        return await notifee.createTriggerNotification(notifeeNotification, trigger);
      } else {
        // Mostrar inmediatamente
        return await notifee.displayNotification(notifeeNotification);
      }
    } catch (error) {
      throw new NativefyError(NativefyErrorCode.UNKNOWN, 'Error al mostrar notificación', error);
    }
  }

  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await notifee.cancelNotification(notificationId);
    } catch (error) {
      throw new NativefyError(NativefyErrorCode.UNKNOWN, 'Error al cancelar notificación', error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await notifee.cancelAllNotifications();
    } catch (error) {
      throw new NativefyError(
        NativefyErrorCode.UNKNOWN,
        'Error al cancelar todas las notificaciones',
        error,
      );
    }
  }

  async getScheduledNotifications(): Promise<string[]> {
    try {
      const notifications = await notifee.getTriggerNotifications();
      return notifications.map((n: { notification: { id?: string } }) => n.notification.id || '');
    } catch (error) {
      throw new NativefyError(
        NativefyErrorCode.UNKNOWN,
        'Error al obtener notificaciones programadas',
        error,
      );
    }
  }

  onNotificationReceived(listener: PushNotificationListener): () => void {
    this.notificationListeners.add(listener);
    return () => {
      this.notificationListeners.delete(listener);
    };
  }

  onNotificationPressed(listener: PushNotificationPressListener): () => void {
    this.pressListeners.add(listener);
    return () => {
      this.pressListeners.delete(listener);
    };
  }

  onTokenRefresh(listener: PushNotificationTokenListener): () => void {
    this.tokenListeners.add(listener);
    return () => {
      this.tokenListeners.delete(listener);
    };
  }

  async createChannel(
    channelId: string,
    channelName: string,
    options?: {
      sound?: string;
      vibration?: boolean;
      importance?: 'low' | 'default' | 'high';
    },
  ): Promise<void> {
    if (Platform.OS !== 'android') {
      return; // Solo Android
    }

    try {
      const importanceMap: Record<string, AndroidImportance> = {
        low: AndroidImportance.LOW,
        default: AndroidImportance.DEFAULT,
        high: AndroidImportance.HIGH,
      };

      await notifee.createChannel({
        id: channelId,
        name: channelName,
        sound: options?.sound || 'default',
        vibration: options?.vibration !== false,
        importance: importanceMap[options?.importance || 'default'] || AndroidImportance.DEFAULT,
      });
    } catch (error) {
      throw new NativefyError(
        NativefyErrorCode.UNKNOWN,
        'Error al crear canal de notificación',
        error,
      );
    }
  }

  async deleteChannel(channelId: string): Promise<void> {
    if (Platform.OS !== 'android') {
      return; // Solo Android
    }

    try {
      await notifee.deleteChannel(channelId);
    } catch (error) {
      throw new NativefyError(
        NativefyErrorCode.UNKNOWN,
        'Error al eliminar canal de notificación',
        error,
      );
    }
  }
}
