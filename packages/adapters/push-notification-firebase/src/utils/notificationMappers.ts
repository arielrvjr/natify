import { Platform } from 'react-native';
import { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import type { PushNotificationData } from '@natify/core';

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
