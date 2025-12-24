import './setup';

import { mapFirebaseMessageToData, mapNotifeeNotificationToData } from '../notificationMappers';
import { PushNotificationPriority } from '@natify/core';
import { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { AndroidImportance } from '@notifee/react-native';
import { Platform } from 'react-native';

jest.mock('@notifee/react-native', () => ({
  AndroidImportance: {
    MIN: 1,
    LOW: 2,
    DEFAULT: 3,
    HIGH: 4,
  },
}));

describe('notificationMappers', () => {
  describe('mapFirebaseMessageToData', () => {
    it('should map Firebase message with all fields', () => {
      const remoteMessage: FirebaseMessagingTypes.RemoteMessage = {
        messageId: 'msg1',
        notification: {
          title: 'Test Title',
          body: 'Test Body',
          android: {
            imageUrl: 'https://example.com/image.jpg',
            sound: 'default',
          },
          ios: {
            sound: 'default',
          },
        },
        data: { key: 'value' },
      };

      const result = mapFirebaseMessageToData(remoteMessage);

      expect(result.title).toBe('Test Title');
      expect(result.body).toBe('Test Body');
      expect(result.data).toEqual({ key: 'value' });
      expect(result.largeImageUrl).toBe('https://example.com/image.jpg');
    });

    it('should handle missing notification', () => {
      const remoteMessage: FirebaseMessagingTypes.RemoteMessage = {
        messageId: 'msg1',
        data: { key: 'value' },
      };

      const result = mapFirebaseMessageToData(remoteMessage);

      expect(result.title).toBe('');
      expect(result.body).toBe('');
      expect(result.data).toEqual({ key: 'value' });
    });

    it('should handle iOS sound correctly', () => {
      (Platform as any).OS = 'ios';
      const remoteMessage: FirebaseMessagingTypes.RemoteMessage = {
        messageId: 'msg1',
        notification: {
          title: 'Test',
          body: 'Test',
          ios: {
            sound: 'custom.wav',
          },
        },
      };

      const result = mapFirebaseMessageToData(remoteMessage);
      expect(result.sound).toBe('custom.wav');
    });

    it('should handle Android sound correctly', () => {
      (Platform as any).OS = 'android';
      const remoteMessage: FirebaseMessagingTypes.RemoteMessage = {
        messageId: 'msg1',
        notification: {
          title: 'Test',
          body: 'Test',
          android: {
            sound: 'default',
          },
        },
      };

      const result = mapFirebaseMessageToData(remoteMessage);
      expect(result.sound).toBe('default');
    });
  });

  describe('mapNotifeeNotificationToData', () => {
    it('should map Notifee notification with all fields', () => {
      const notif = {
        title: 'Notifee Title',
        body: 'Notifee Body',
        data: { notifeeKey: 'notifeeValue' },
        android: {
          largeIcon: 'large_icon',
          smallIcon: 'small_icon',
          importance: AndroidImportance.HIGH,
          channelId: 'custom-channel',
          vibrate: true,
        },
        ios: {
          badge: 5,
        },
        sound: 'custom_sound',
      };

      const result = mapNotifeeNotificationToData(notif);

      expect(result.title).toBe('Notifee Title');
      expect(result.body).toBe('Notifee Body');
      expect(result.data).toEqual({ notifeeKey: 'notifeeValue' });
      expect(result.largeImageUrl).toBe('large_icon');
      expect(result.smallImageUrl).toBe('small_icon');
      expect(result.priority).toBe(PushNotificationPriority.High);
      expect(result.channelId).toBe('custom-channel');
      expect(result.vibration).toBe(true);
      expect(result.badge).toBe(5);
      expect(result.sound).toBe('custom_sound');
    });

    it('should handle missing fields', () => {
      const notif = {
        title: 'Title',
        body: 'Body',
      };

      const result = mapNotifeeNotificationToData(notif);

      expect(result.title).toBe('Title');
      expect(result.body).toBe('Body');
      expect(result.data).toEqual({});
      expect(result.vibration).toBe(true); // default
    });

    it('should handle vibration false', () => {
      const notif = {
        title: 'Title',
        body: 'Body',
        android: {
          vibrate: false,
        },
      };

      const result = mapNotifeeNotificationToData(notif);
      expect(result.vibration).toBe(false);
    });
  });
});

