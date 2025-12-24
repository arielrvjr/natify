const mockNotifee = {
  displayNotification: jest.fn(),
  createTriggerNotification: jest.fn(),
  cancelNotification: jest.fn(),
  cancelAllNotifications: jest.fn(),
  getTriggerNotifications: jest.fn(),
  onForegroundEvent: jest.fn(),
  onBackgroundEvent: jest.fn(),
  requestPermission: jest.fn(),
  getNotificationSettings: jest.fn(),
  createChannel: jest.fn(),
  deleteChannel: jest.fn(),
};

jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: mockNotifee,
  AndroidImportance: {
    MIN: 1,
    LOW: 2,
    DEFAULT: 3,
    HIGH: 4,
  },
  EventType: {
    PRESS: 'PRESS',
  },
  TriggerType: {
    TIMESTAMP: 'TIMESTAMP',
  },
}));

jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
  StyleSheet: {
    create: jest.fn((styles) => styles),
    flatten: jest.fn((style) => style),
  },
}));

import { NotifeePushAdapter } from '../src';
import { PushNotificationPriority, NatifyError } from '@natify/core';

describe('NotifeePushAdapter', () => {
  let adapter: NotifeePushAdapter;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNotifee.onForegroundEvent.mockReturnValue(() => {});
    adapter = new NotifeePushAdapter();
  });

  describe('capability', () => {
    it('should have correct capability', () => {
      expect(adapter.capability).toBe('push-notification');
    });
  });

  describe('requestPermission', () => {
    it('should return true when permission is granted', async () => {
      mockNotifee.requestPermission.mockResolvedValue({
        authorizationStatus: 1, // AUTHORIZED
      });

      const result = await adapter.requestPermission();

      expect(result).toBe(true);
      expect(mockNotifee.requestPermission).toHaveBeenCalled();
    });

    it('should return false when permission is denied', async () => {
      mockNotifee.requestPermission.mockResolvedValue({
        authorizationStatus: 0, // DENIED
      });

      const result = await adapter.requestPermission();

      expect(result).toBe(false);
    });

    it('should throw NatifyError when request fails', async () => {
      const error = new Error('Permission request failed');
      mockNotifee.requestPermission.mockRejectedValue(error);

      await expect(adapter.requestPermission()).rejects.toThrow(NatifyError);
      await expect(adapter.requestPermission()).rejects.toThrow('Error al solicitar permisos de notificación');
    });
  });

  describe('hasPermission', () => {
    it('should return true when permission is granted', async () => {
      mockNotifee.getNotificationSettings.mockResolvedValue({
        authorizationStatus: 1, // AUTHORIZED
      });

      const result = await adapter.hasPermission();

      expect(result).toBe(true);
      expect(mockNotifee.getNotificationSettings).toHaveBeenCalled();
    });

    it('should return false when permission is denied', async () => {
      mockNotifee.getNotificationSettings.mockResolvedValue({
        authorizationStatus: 0, // DENIED
      });

      const result = await adapter.hasPermission();

      expect(result).toBe(false);
    });

    it('should throw NatifyError when check fails', async () => {
      const error = new Error('Permission check failed');
      mockNotifee.getNotificationSettings.mockRejectedValue(error);

      await expect(adapter.hasPermission()).rejects.toThrow(NatifyError);
      await expect(adapter.hasPermission()).rejects.toThrow('Error al verificar permisos de notificación');
    });
  });

  describe('getToken', () => {
    it('should return null (Notifee does not provide tokens)', async () => {
      const result = await adapter.getToken();

      expect(result).toBeNull();
    });
  });

  describe('deleteToken', () => {
    it('should do nothing (Notifee does not handle tokens)', async () => {
      await adapter.deleteToken();

      // No debería lanzar error
      expect(true).toBe(true);
    });
  });

  describe('displayNotification', () => {
    it('should display notification immediately when no scheduleId', async () => {
      mockNotifee.displayNotification.mockResolvedValue('notification-id');

      const result = await adapter.displayNotification({
        title: 'Test',
        body: 'Test body',
      });

      expect(result).toBe('notification-id');
      expect(mockNotifee.displayNotification).toHaveBeenCalled();
      expect(mockNotifee.createTriggerNotification).not.toHaveBeenCalled();
    });

    it('should schedule notification when scheduleId is provided', async () => {
      mockNotifee.createTriggerNotification.mockResolvedValue('notification-id');

      const result = await adapter.displayNotification(
        {
          title: 'Test',
          body: 'Test body',
        },
        'schedule-id',
      );

      expect(result).toBe('notification-id');
      expect(mockNotifee.createTriggerNotification).toHaveBeenCalled();
    });

    it('should throw NatifyError when displayNotification fails', async () => {
      const error = new Error('Display notification failed');
      mockNotifee.displayNotification.mockRejectedValue(error);

      await expect(
        adapter.displayNotification({
          title: 'Test',
          body: 'Test body',
        }),
      ).rejects.toThrow(NatifyError);
      await expect(
        adapter.displayNotification({
          title: 'Test',
          body: 'Test body',
        }),
      ).rejects.toThrow('Error al mostrar notificación');
    });
  });

  describe('cancelNotification', () => {
    it('should cancel notification successfully', async () => {
      mockNotifee.cancelNotification.mockResolvedValue(undefined);

      await adapter.cancelNotification('notification-id');

      expect(mockNotifee.cancelNotification).toHaveBeenCalledWith('notification-id');
    });

    it('should throw NatifyError when cancelNotification fails', async () => {
      const error = new Error('Cancel notification failed');
      mockNotifee.cancelNotification.mockRejectedValue(error);

      await expect(adapter.cancelNotification('notification-id')).rejects.toThrow(NatifyError);
      await expect(adapter.cancelNotification('notification-id')).rejects.toThrow('Error al cancelar notificación');
    });
  });

  describe('cancelAllNotifications', () => {
    it('should cancel all notifications successfully', async () => {
      mockNotifee.cancelAllNotifications.mockResolvedValue(undefined);

      await adapter.cancelAllNotifications();

      expect(mockNotifee.cancelAllNotifications).toHaveBeenCalled();
    });

    it('should throw NatifyError when cancelAllNotifications fails', async () => {
      const error = new Error('Cancel all notifications failed');
      mockNotifee.cancelAllNotifications.mockRejectedValue(error);

      await expect(adapter.cancelAllNotifications()).rejects.toThrow(NatifyError);
      await expect(adapter.cancelAllNotifications()).rejects.toThrow('Error al cancelar todas las notificaciones');
    });
  });

  describe('getScheduledNotifications', () => {
    it('should return scheduled notification IDs', async () => {
      mockNotifee.getTriggerNotifications.mockResolvedValue([
        { notification: { id: 'id1' } },
        { notification: { id: 'id2' } },
      ]);

      const result = await adapter.getScheduledNotifications();

      expect(result).toEqual(['id1', 'id2']);
      expect(mockNotifee.getTriggerNotifications).toHaveBeenCalled();
    });

    it('should return empty array when no scheduled notifications', async () => {
      mockNotifee.getTriggerNotifications.mockResolvedValue([]);

      const result = await adapter.getScheduledNotifications();

      expect(result).toEqual([]);
    });

    it('should throw NatifyError when getScheduledNotifications fails', async () => {
      const error = new Error('Get scheduled notifications failed');
      mockNotifee.getTriggerNotifications.mockRejectedValue(error);

      await expect(adapter.getScheduledNotifications()).rejects.toThrow(NatifyError);
      await expect(adapter.getScheduledNotifications()).rejects.toThrow('Error al obtener notificaciones programadas');
    });
  });

  describe('onNotificationReceived', () => {
    it('should register and unregister listener', () => {
      const listener = jest.fn();
      const unsubscribe = adapter.onNotificationReceived(listener);

      expect(typeof unsubscribe).toBe('function');

      unsubscribe();
    });
  });

  describe('onNotificationPressed', () => {
    it('should register and unregister listener', () => {
      const listener = jest.fn();
      const unsubscribe = adapter.onNotificationPressed(listener);

      expect(typeof unsubscribe).toBe('function');

      unsubscribe();
    });
  });

  describe('onTokenRefresh', () => {
    it('should register and unregister listener', () => {
      const listener = jest.fn();
      const unsubscribe = adapter.onTokenRefresh(listener);

      expect(typeof unsubscribe).toBe('function');

      unsubscribe();
    });
  });

  describe('createChannel', () => {
    it('should create channel on Android', async () => {
      require('react-native').Platform.OS = 'android';

      mockNotifee.createChannel.mockResolvedValue(undefined);

      await adapter.createChannel('channel-id', 'Channel Name');

      expect(mockNotifee.createChannel).toHaveBeenCalled();
    });

    it('should do nothing on iOS', async () => {
      require('react-native').Platform.OS = 'ios';

      await adapter.createChannel('channel-id', 'Channel Name');

      expect(mockNotifee.createChannel).not.toHaveBeenCalled();
    });

    it('should throw NatifyError when createChannel fails', async () => {
      require('react-native').Platform.OS = 'android';
      const error = new Error('Create channel failed');
      mockNotifee.createChannel.mockRejectedValue(error);

      await expect(adapter.createChannel('channel-id', 'Channel Name')).rejects.toThrow(NatifyError);
      await expect(adapter.createChannel('channel-id', 'Channel Name')).rejects.toThrow('Error al crear canal de notificación');
    });
  });

  describe('deleteChannel', () => {
    it('should delete channel on Android', async () => {
      require('react-native').Platform.OS = 'android';

      mockNotifee.deleteChannel.mockResolvedValue(undefined);

      await adapter.deleteChannel('channel-id');

      expect(mockNotifee.deleteChannel).toHaveBeenCalledWith('channel-id');
    });

    it('should do nothing on iOS', async () => {
      require('react-native').Platform.OS = 'ios';

      await adapter.deleteChannel('channel-id');

      expect(mockNotifee.deleteChannel).not.toHaveBeenCalled();
    });

    it('should throw NatifyError when deleteChannel fails', async () => {
      require('react-native').Platform.OS = 'android';
      const error = new Error('Delete channel failed');
      mockNotifee.deleteChannel.mockRejectedValue(error);

      await expect(adapter.deleteChannel('channel-id')).rejects.toThrow(NatifyError);
      await expect(adapter.deleteChannel('channel-id')).rejects.toThrow('Error al eliminar canal de notificación');
    });
  });
});

