import './setup';

import { mapFirebaseMessageToData } from '../notificationMappers';
import { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

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
});
