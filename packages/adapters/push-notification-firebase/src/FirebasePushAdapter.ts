import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import {
  PushNotificationPort,
  PushNotificationData,
  PushNotificationToken,
  PushNotificationListener,
  PushNotificationPressListener,
  PushNotificationTokenListener,
} from '@natify/core';
import { NatifyError, NatifyErrorCode } from '@natify/core';
import { mapFirebaseMessageToData } from './utils/notificationMappers';

/**
 * Adapter de Push Notifications usando Firebase Cloud Messaging (FCM)
 *
 * Este adapter se enfoca en recibir notificaciones remotas y manejar tokens FCM.
 * Para mostrar notificaciones locales, usa @natify/push-notification-notifee.
 */
export class FirebasePushAdapter implements PushNotificationPort {
  readonly capability = 'push-notification';

  private notificationListeners: Set<PushNotificationListener> = new Set();
  private pressListeners: Set<PushNotificationPressListener> = new Set();
  private tokenListeners: Set<PushNotificationTokenListener> = new Set();
  private unsubscribeMessaging: (() => void)[] = [];

  constructor() {
    this.setupEventListeners();
  }

  /**
   * Configura los listeners de eventos de Firebase Messaging
   */
  private setupEventListeners(): void {
    // Listener para cuando se recibe una notificación en foreground (Firebase)
    const unsubscribeForeground = messaging().onMessage(
      async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
        // Notificar a los listeners
        const notification = mapFirebaseMessageToData(remoteMessage);
        this.notificationListeners.forEach(listener => listener(notification));
      },
    );
    this.unsubscribeMessaging.push(unsubscribeForeground);

    // Listener para cuando se presiona una notificación en background (Firebase)
    const unsubscribeBackground = messaging().onNotificationOpenedApp(
      (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
        const notification = mapFirebaseMessageToData(remoteMessage);
        this.pressListeners.forEach(listener => listener(notification));
      },
    );
    this.unsubscribeMessaging.push(unsubscribeBackground);

    // Listener para cuando se presiona una notificación que abrió la app (Firebase)
    messaging()
      .getInitialNotification()
      .then((remoteMessage: FirebaseMessagingTypes.RemoteMessage | null) => {
        if (remoteMessage) {
          const notification = mapFirebaseMessageToData(remoteMessage);
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
  }

  async requestPermission(): Promise<boolean> {
    try {
      const authStatus = await messaging().requestPermission();
      return (
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL
      );
    } catch (error) {
      throw new NatifyError(
        NatifyErrorCode.UNKNOWN,
        'Error al solicitar permisos de notificación',
        error,
      );
    }
  }

  async hasPermission(): Promise<boolean> {
    try {
      const authStatus = await messaging().hasPermission();
      return (
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL
      );
    } catch (error) {
      throw new NatifyError(
        NatifyErrorCode.UNKNOWN,
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
      throw new NatifyError(
        NatifyErrorCode.UNKNOWN,
        'Error al obtener token de notificación',
        error,
      );
    }
  }

  async deleteToken(): Promise<void> {
    try {
      await messaging().deleteToken();
    } catch (error) {
      throw new NatifyError(
        NatifyErrorCode.UNKNOWN,
        'Error al eliminar token de notificación',
        error,
      );
    }
  }

  async displayNotification(
    _notification: PushNotificationData,
    _scheduleId?: string,
  ): Promise<string> {
    throw new NatifyError(
      NatifyErrorCode.VALIDATION_ERROR,
      'Firebase Messaging no soporta notificaciones locales. Usa @natify/push-notification-notifee para mostrar notificaciones locales.',
    );
  }

  async cancelNotification(_notificationId: string): Promise<void> {
    throw new NatifyError(
      NatifyErrorCode.VALIDATION_ERROR,
      'Firebase Messaging no soporta cancelar notificaciones locales. Usa @natify/push-notification-notifee para gestionar notificaciones locales.',
    );
  }

  async cancelAllNotifications(): Promise<void> {
    throw new NatifyError(
      NatifyErrorCode.VALIDATION_ERROR,
      'Firebase Messaging no soporta cancelar notificaciones locales. Usa @natify/push-notification-notifee para gestionar notificaciones locales.',
    );
  }

  async getScheduledNotifications(): Promise<string[]> {
    throw new NatifyError(
      NatifyErrorCode.VALIDATION_ERROR,
      'Firebase Messaging no soporta notificaciones programadas. Usa @natify/push-notification-notifee para gestionar notificaciones locales.',
    );
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

  // createChannel y deleteChannel no están disponibles en Firebase Messaging
  // Usa @natify/push-notification-notifee para gestionar canales
}
