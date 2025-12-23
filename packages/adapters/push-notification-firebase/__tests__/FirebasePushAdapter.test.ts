const mockOnMessage = jest.fn();
const mockOnNotificationOpenedApp = jest.fn();
const mockGetInitialNotification = jest.fn();
const mockOnTokenRefresh = jest.fn();
const mockRequestPermission = jest.fn();
const mockHasPermission = jest.fn();
const mockGetToken = jest.fn();
const mockDeleteToken = jest.fn();

// AuthorizationStatus debe estar disponible tanto en la instancia como en el módulo
const AuthorizationStatus = {
  AUTHORIZED: 1,
  PROVISIONAL: 2,
  DENIED: 0,
};

const mockMessagingInstance = {
  onMessage: mockOnMessage,
  onNotificationOpenedApp: mockOnNotificationOpenedApp,
  getInitialNotification: mockGetInitialNotification,
  onTokenRefresh: mockOnTokenRefresh,
  requestPermission: mockRequestPermission,
  hasPermission: mockHasPermission,
  getToken: mockGetToken,
  deleteToken: mockDeleteToken,
  AuthorizationStatus, // Agregar AuthorizationStatus a la instancia
};

const mockMessaging = jest.fn(() => mockMessagingInstance);

const mockNotifee = {
  displayNotification: jest.fn(),
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

jest.mock('@react-native-firebase/messaging', () => ({
  __esModule: true,
  default: mockMessaging,
  AuthorizationStatus: {
    AUTHORIZED: 1,
    PROVISIONAL: 2,
    DENIED: 0,
  },
}));

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

import { FirebasePushAdapter } from '../src';
import { PushNotificationPriority, NativefyError } from '@nativefy/core';

describe('FirebasePushAdapter', () => {
  let adapter: FirebasePushAdapter;

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnMessage.mockReturnValue(() => {});
    mockOnNotificationOpenedApp.mockReturnValue(() => {});
    mockGetInitialNotification.mockResolvedValue(null);
    mockOnTokenRefresh.mockReturnValue(() => {});
    mockNotifee.onForegroundEvent.mockReturnValue(() => {});
    adapter = new FirebasePushAdapter();
  });

  describe('capability', () => {
    it('should have correct capability', () => {
      expect(adapter.capability).toBe('push-notification');
    });
  });

  describe('requestPermission', () => {
    it('should return true when permission is granted on iOS', async () => {
      require('react-native').Platform.OS = 'ios';
      // El código compara con messaging().AuthorizationStatus.AUTHORIZED (que es 1)
      mockRequestPermission.mockResolvedValue(1); // AUTHORIZED

      const result = await adapter.requestPermission();

      expect(result).toBe(true);
      expect(mockRequestPermission).toHaveBeenCalled();
    });

    it('should return true when permission is provisional on iOS', async () => {
      require('react-native').Platform.OS = 'ios';
      mockRequestPermission.mockResolvedValue(2); // PROVISIONAL

      const result = await adapter.requestPermission();

      expect(result).toBe(true);
    });

    it('should return false when permission is denied', async () => {
      require('react-native').Platform.OS = 'ios';
      mockRequestPermission.mockResolvedValue(0); // DENIED

      const result = await adapter.requestPermission();

      expect(result).toBe(false);
    });

    it('should check both Firebase and Notifee permissions on Android', async () => {
      require('react-native').Platform.OS = 'android';
      mockRequestPermission.mockResolvedValue(1); // AUTHORIZED
      mockNotifee.requestPermission.mockResolvedValue({
        authorizationStatus: 1, // AUTHORIZED
      });

      const result = await adapter.requestPermission();

      expect(result).toBe(true);
      expect(mockRequestPermission).toHaveBeenCalled();
      expect(mockNotifee.requestPermission).toHaveBeenCalled();
    });

    it('should throw NativefyError when request fails', async () => {
      require('react-native').Platform.OS = 'ios';
      const error = new Error('Permission request failed');
      mockRequestPermission.mockRejectedValue(error);

      await expect(adapter.requestPermission()).rejects.toThrow(NativefyError);
      await expect(adapter.requestPermission()).rejects.toThrow('Error al solicitar permisos de notificación');
    });
  });

  describe('hasPermission', () => {
    it('should return true when permission is granted on iOS', async () => {
      require('react-native').Platform.OS = 'ios';
      // El código compara con messaging().AuthorizationStatus.AUTHORIZED (que es 1)
      mockHasPermission.mockResolvedValue(1); // AUTHORIZED

      const result = await adapter.hasPermission();

      expect(result).toBe(true);
      expect(mockHasPermission).toHaveBeenCalled();
    });

    it('should return true when permission is provisional on iOS', async () => {
      require('react-native').Platform.OS = 'ios';
      mockHasPermission.mockResolvedValue(2); // PROVISIONAL

      const result = await adapter.hasPermission();

      expect(result).toBe(true);
    });

    it('should return false when permission is denied', async () => {
      require('react-native').Platform.OS = 'ios';
      mockHasPermission.mockResolvedValue(0); // DENIED

      const result = await adapter.hasPermission();

      expect(result).toBe(false);
    });

    it('should throw NativefyError when check fails', async () => {
      const error = new Error('Permission check failed');
      mockHasPermission.mockRejectedValue(error);

      await expect(adapter.hasPermission()).rejects.toThrow(NativefyError);
      await expect(adapter.hasPermission()).rejects.toThrow('Error al verificar permisos de notificación');
    });
  });

  describe('getToken', () => {
    it('should return token when available', async () => {
      mockGetToken.mockResolvedValue('test-token');

      const result = await adapter.getToken();

      expect(result).toEqual({
        token: 'test-token',
        platform: 'ios',
      });
      expect(mockGetToken).toHaveBeenCalled();
    });

    it('should return null when token is not available', async () => {
      mockGetToken.mockResolvedValue(null);

      const result = await adapter.getToken();

      expect(result).toBeNull();
    });

    it('should throw NativefyError when getToken fails', async () => {
      const error = new Error('Get token failed');
      mockGetToken.mockRejectedValue(error);

      await expect(adapter.getToken()).rejects.toThrow(NativefyError);
      await expect(adapter.getToken()).rejects.toThrow('Error al obtener token de notificación');
    });
  });

  describe('deleteToken', () => {
    it('should delete token successfully', async () => {
      mockDeleteToken.mockResolvedValue(undefined);

      await adapter.deleteToken();

      expect(mockDeleteToken).toHaveBeenCalled();
    });

    it('should throw NativefyError when deleteToken fails', async () => {
      const error = new Error('Delete token failed');
      mockDeleteToken.mockRejectedValue(error);

      await expect(adapter.deleteToken()).rejects.toThrow(NativefyError);
      await expect(adapter.deleteToken()).rejects.toThrow('Error al eliminar token de notificación');
    });
  });

  describe('displayNotification', () => {
    it('should display notification successfully', async () => {
      mockNotifee.displayNotification.mockResolvedValue('notification-id');

      const result = await adapter.displayNotification({
        title: 'Test',
        body: 'Test body',
      });

      expect(result).toBe('notification-id');
      expect(mockNotifee.displayNotification).toHaveBeenCalled();
    });

    it('should throw NativefyError when displayNotification fails', async () => {
      const error = new Error('Display notification failed');
      mockNotifee.displayNotification.mockRejectedValue(error);

      await expect(
        adapter.displayNotification({
          title: 'Test',
          body: 'Test body',
        }),
      ).rejects.toThrow(NativefyError);
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

    it('should throw NativefyError when cancelNotification fails', async () => {
      const error = new Error('Cancel notification failed');
      mockNotifee.cancelNotification.mockRejectedValue(error);

      await expect(adapter.cancelNotification('notification-id')).rejects.toThrow(NativefyError);
      await expect(adapter.cancelNotification('notification-id')).rejects.toThrow('Error al cancelar notificación');
    });
  });

  describe('cancelAllNotifications', () => {
    it('should cancel all notifications successfully', async () => {
      mockNotifee.cancelAllNotifications.mockResolvedValue(undefined);

      await adapter.cancelAllNotifications();

      expect(mockNotifee.cancelAllNotifications).toHaveBeenCalled();
    });

    it('should throw NativefyError when cancelAllNotifications fails', async () => {
      const error = new Error('Cancel all notifications failed');
      mockNotifee.cancelAllNotifications.mockRejectedValue(error);

      await expect(adapter.cancelAllNotifications()).rejects.toThrow(NativefyError);
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

    it('should throw NativefyError when getScheduledNotifications fails', async () => {
      const error = new Error('Get scheduled notifications failed');
      mockNotifee.getTriggerNotifications.mockRejectedValue(error);

      await expect(adapter.getScheduledNotifications()).rejects.toThrow(NativefyError);
      await expect(adapter.getScheduledNotifications()).rejects.toThrow('Error al obtener notificaciones programadas');
    });
  });

  describe('onNotificationReceived', () => {
    it('should register and unregister listener', () => {
      const listener = jest.fn();
      const unsubscribe = adapter.onNotificationReceived(listener);

      expect(typeof unsubscribe).toBe('function');

      unsubscribe();
      // Verificar que el listener se puede remover (no hay forma directa de verificar esto sin eventos)
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
      // Cambiar a Android para este test
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

    it('should throw NativefyError when createChannel fails', async () => {
      require('react-native').Platform.OS = 'android';
      const error = new Error('Create channel failed');
      mockNotifee.createChannel.mockRejectedValue(error);

      await expect(adapter.createChannel('channel-id', 'Channel Name')).rejects.toThrow(NativefyError);
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

    it('should throw NativefyError when deleteChannel fails', async () => {
      require('react-native').Platform.OS = 'android';
      const error = new Error('Delete channel failed');
      mockNotifee.deleteChannel.mockRejectedValue(error);

      await expect(adapter.deleteChannel('channel-id')).rejects.toThrow(NativefyError);
      await expect(adapter.deleteChannel('channel-id')).rejects.toThrow('Error al eliminar canal de notificación');
    });
  });
});

