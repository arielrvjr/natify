import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import notifee, {
  AndroidImportance,
  AndroidNotificationSetting,
  EventType,
} from 'react-native-notifee';
import { Platform } from 'react-native';
import {
  PushNotificationPort,
  PushNotificationData,
  PushNotificationToken,
  PushNotificationListener,
  PushNotificationPressListener,
  PushNotificationTokenListener,
  PushNotificationPriority,
  PushNotificationAction,
} from '@nativefy/core';
import { NativefyError, NativefyErrorCode } from '@nativefy/core';

/**
 * Adapter de Push Notifications usando Firebase Cloud Messaging (FCM)
 *
 * Este adapter combina Firebase Messaging para recibir tokens y notificaciones remotas,
 * con Notifee para mostrar notificaciones locales y manejar la UI de notificaciones.
 */
export class FirebasePushAdapter implements PushNotificationPort {
  readonly capability = 'push-notification';

  private notificationListeners: Set<PushNotificationListener> = new Set();
  private pressListeners: Set<PushNotificationPressListener> = new Set();
  private tokenListeners: Set<PushNotificationTokenListener> = new Set();
  private unsubscribeMessaging: (() => void)[] = [];
  private unsubscribeNotifee: (() => void)[] = [];

  constructor() {
    this.setupEventListeners();
  }

  /**
   * Configura los listeners de eventos de Firebase y Notifee
   */
  private setupEventListeners(): void {
    // Listener para cuando se recibe una notificación en foreground (Firebase)
    const unsubscribeForeground = messaging().onMessage(async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      // Mostrar la notificación usando Notifee
      await this.displayNotificationFromFirebase(remoteMessage);

      // Notificar a los listeners
      const notification = this.mapFirebaseMessageToData(remoteMessage);
      this.notificationListeners.forEach(listener => listener(notification));
    });
    this.unsubscribeMessaging.push(unsubscribeForeground);

    // Listener para cuando se presiona una notificación en background (Firebase)
    const unsubscribeBackground = messaging().onNotificationOpenedApp((remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      const notification = this.mapFirebaseMessageToData(remoteMessage);
      this.pressListeners.forEach(listener => listener(notification));
    });
    this.unsubscribeMessaging.push(unsubscribeBackground);

    // Listener para cuando se presiona una notificación que abrió la app (Firebase)
    messaging()
      .getInitialNotification()
      .then((remoteMessage: FirebaseMessagingTypes.RemoteMessage | null) => {
        if (remoteMessage) {
          const notification = this.mapFirebaseMessageToData(remoteMessage);
          this.pressListeners.forEach(listener => listener(notification));
        }
      });

    // Listener para cuando se recibe un nuevo token (Firebase)
    const unsubscribeToken = messaging().onTokenRefresh((token: string) => {
      const pushToken: PushNotificationToken = {
        token,
        platform: Platform.OS === 'ios' ? 'ios' : 'android',
      };
      this.tokenListeners.forEach(listener => listener(pushToken));
    });
    this.unsubscribeMessaging.push(unsubscribeToken);

    // Listener para cuando se presiona una notificación (Notifee)
    const unsubscribeNotifeePress = notifee.onForegroundEvent(({ type, detail }: { type: EventType; detail: any }) => {
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
    this.unsubscribeNotifee.push(unsubscribeNotifeePress);

    // Listener para cuando se presiona una notificación en background (Notifee)
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
   * Mapea un mensaje de Firebase a PushNotificationData
   */
  private mapFirebaseMessageToData(
    remoteMessage: FirebaseMessagingTypes.RemoteMessage,
  ): PushNotificationData {
    return {
      title: remoteMessage.notification?.title || '',
      body: remoteMessage.notification?.body || '',
      data: remoteMessage.data || {},
      largeImageUrl: remoteMessage.notification?.android?.imageUrl,
      sound: remoteMessage.notification?.sound,
      priority: this.mapFirebasePriorityToPriority(remoteMessage.notification?.android?.priority),
    };
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
   * Mapea la prioridad de Firebase a PushNotificationPriority
   */
  private mapFirebasePriorityToPriority(
    priority?: 'min' | 'low' | 'default' | 'high' | 'max',
  ): PushNotificationPriority {
    switch (priority) {
      case 'min':
        return PushNotificationPriority.Min;
      case 'low':
        return PushNotificationPriority.Low;
      case 'high':
        return PushNotificationPriority.High;
      case 'max':
        return PushNotificationPriority.Max;
      default:
        return PushNotificationPriority.Default;
    }
  }

  /**
   * Mapea la importancia de Android a PushNotificationPriority
   */
  private mapAndroidImportanceToPriority(
    importance?: AndroidImportance,
  ): PushNotificationPriority {
    switch (importance) {
      case AndroidImportance.MIN:
        return PushNotificationPriority.Min;
      case AndroidImportance.LOW:
        return PushNotificationPriority.Low;
      case AndroidImportance.HIGH:
        return PushNotificationPriority.High;
      case AndroidImportance.MAX:
        return PushNotificationPriority.Max;
      default:
        return PushNotificationPriority.Default;
    }
  }

  /**
   * Mapea PushNotificationPriority a AndroidImportance
   */
  private mapPriorityToAndroidImportance(
    priority: PushNotificationPriority,
  ): AndroidImportance {
    switch (priority) {
      case PushNotificationPriority.Min:
        return AndroidImportance.MIN;
      case PushNotificationPriority.Low:
        return AndroidImportance.LOW;
      case PushNotificationPriority.High:
        return AndroidImportance.HIGH;
      case PushNotificationPriority.Max:
        return AndroidImportance.MAX;
      default:
        return AndroidImportance.DEFAULT;
    }
  }

  /**
   * Muestra una notificación desde un mensaje de Firebase usando Notifee
   */
  private async displayNotificationFromFirebase(
    remoteMessage: FirebaseMessagingTypes.RemoteMessage,
  ): Promise<void> {
    const notification = remoteMessage.notification;
    if (!notification) return;

    try {
      await notifee.displayNotification({
        title: notification.title || '',
        body: notification.body || '',
        data: remoteMessage.data || {},
        android: {
          channelId: 'default',
          importance: AndroidImportance.HIGH,
          smallIcon: 'ic_notification',
          largeIcon: notification.android?.imageUrl,
          pressAction: {
            id: 'default',
          },
        },
        ios: {
          sound: notification.sound || 'default',
        },
      });
    } catch (error) {
      console.error('[FirebasePushAdapter] Error al mostrar notificación:', error);
    }
  }

  async requestPermission(): Promise<boolean> {
    try {
      // Solicitar permisos de Firebase
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (Platform.OS === 'android') {
        // También solicitar permisos de Notifee en Android
        const notifeeSettings = await notifee.requestPermission();
        return (
          enabled &&
          (notifeeSettings.authorizationStatus === AndroidNotificationSetting.AUTHORIZED ||
            notifeeSettings.authorizationStatus ===
              AndroidNotificationSetting.AUTHORIZED_PROVISIONAL)
        );
      }

      return enabled;
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
      const authStatus = await messaging().hasPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (Platform.OS === 'android') {
        const notifeeSettings = await notifee.getNotificationSettings();
        return (
          enabled &&
          (notifeeSettings.authorizationStatus === AndroidNotificationSetting.AUTHORIZED ||
            notifeeSettings.authorizationStatus ===
              AndroidNotificationSetting.AUTHORIZED_PROVISIONAL)
        );
      }

      return enabled;
    } catch (error) {
      throw new NativefyError(
        NativefyErrorCode.UNKNOWN,
        'Error al verificar permisos de notificación',
        error,
      );
    }
  }

  async getToken(): Promise<PushNotificationToken | null> {
    try {
      const token = await messaging().getToken();
      if (!token) return null;

      return {
        token,
        platform: Platform.OS === 'ios' ? 'ios' : 'android',
      };
    } catch (error) {
      throw new NativefyError(
        NativefyErrorCode.UNKNOWN,
        'Error al obtener token de notificación',
        error,
      );
    }
  }

  async deleteToken(): Promise<void> {
    try {
      await messaging().deleteToken();
    } catch (error) {
      throw new NativefyError(
        NativefyErrorCode.UNKNOWN,
        'Error al eliminar token de notificación',
        error,
      );
    }
  }

  async displayNotification(
    notification: PushNotificationData,
    scheduleId?: string,
  ): Promise<string> {
    try {
      // Usar Notifee para mostrar notificaciones locales
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

      return await notifee.displayNotification(notifeeNotification);
    } catch (error) {
      throw new NativefyError(
        NativefyErrorCode.UNKNOWN,
        'Error al mostrar notificación',
        error,
      );
    }
  }

  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await notifee.cancelNotification(notificationId);
    } catch (error) {
      throw new NativefyError(
        NativefyErrorCode.UNKNOWN,
        'Error al cancelar notificación',
        error,
      );
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

