import { Platform } from 'react-native';
import { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { AndroidImportance } from '@notifee/react-native';
import type { PushNotificationData } from '@natify/core';
import { mapAndroidImportanceToPriority } from './priorityMappers';

/**
 * Mapea un mensaje de Firebase a PushNotificationData
 */
export function mapFirebaseMessageToData(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
): PushNotificationData {
  return {
    title: remoteMessage.notification?.title || '',
    body: remoteMessage.notification?.body || '',
    data: remoteMessage.data || {},
    largeImageUrl: remoteMessage.notification?.android?.imageUrl,
    sound:
      Platform.OS === 'ios'
        ? remoteMessage.notification?.ios?.sound?.toString()
        : remoteMessage.notification?.android?.sound,
  };
}

/**
 * Mapea una notificación de Notifee a PushNotificationData
 */
export function mapNotifeeNotificationToData(notif: any): PushNotificationData {
  return {
    title: notif.title || '',
    body: notif.body || '',
    data: notif.data || {},
    largeImageUrl: notif.android?.largeIcon,
    smallImageUrl: notif.android?.smallIcon,
    sound: notif.sound,
    priority: mapAndroidImportanceToPriority(notif.android?.importance),
    channelId: notif.android?.channelId,
    vibration: notif.android?.vibrate !== false,
    badge: notif.ios?.badge,
  };
}

