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
};

const mockMessaging = Object.assign(jest.fn(() => mockMessagingInstance), { AuthorizationStatus });

jest.mock('@react-native-firebase/messaging', () => ({
  __esModule: true,
  default: mockMessaging,
  AuthorizationStatus,
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
import { NatifyError } from '@natify/core';

describe('FirebasePushAdapter', () => {
  let adapter: FirebasePushAdapter;

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnMessage.mockReturnValue(() => {});
    mockOnNotificationOpenedApp.mockReturnValue(() => {});
    mockGetInitialNotification.mockResolvedValue(null);
    mockOnTokenRefresh.mockReturnValue(() => {});
    adapter = new FirebasePushAdapter();
  });

  describe('capability', () => {
    it('should have correct capability', () => {
      expect(adapter.capability).toBe('push-notification');
    });
  });

  describe('requestPermission', () => {
    it('should return true when permission is granted', async () => {
      require('react-native').Platform.OS = 'ios';
      mockRequestPermission.mockResolvedValue(1); // AUTHORIZED

      const result = await adapter.requestPermission();

      expect(result).toBe(true);
      expect(mockRequestPermission).toHaveBeenCalled();
    });

    it('should return true when permission is provisional', async () => {
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

    it('should throw NatifyError when request fails', async () => {
      require('react-native').Platform.OS = 'ios';
      const error = new Error('Permission request failed');
      mockRequestPermission.mockRejectedValue(error);

      await expect(adapter.requestPermission()).rejects.toThrow(NatifyError);
      await expect(adapter.requestPermission()).rejects.toThrow('Error al solicitar permisos de notificación');
    });
  });

  describe('hasPermission', () => {
    it('should return true when permission is granted', async () => {
      require('react-native').Platform.OS = 'ios';
      mockHasPermission.mockResolvedValue(1); // AUTHORIZED

      const result = await adapter.hasPermission();

      expect(result).toBe(true);
      expect(mockHasPermission).toHaveBeenCalled();
    });

    it('should return true when permission is provisional', async () => {
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

    it('should throw NatifyError when check fails', async () => {
      const error = new Error('Permission check failed');
      mockHasPermission.mockRejectedValue(error);

      await expect(adapter.hasPermission()).rejects.toThrow(NatifyError);
      await expect(adapter.hasPermission()).rejects.toThrow('Error al verificar permisos de notificación');
    });
  });

  describe('getToken', () => {
    it('should return token when available', async () => {
      require('react-native').Platform.OS = 'ios';
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

    it('should return token with android platform when on Android', async () => {
      require('react-native').Platform.OS = 'android';
      mockGetToken.mockResolvedValue('test-token');

      const result = await adapter.getToken();

      expect(result).toEqual({
        token: 'test-token',
        platform: 'android',
      });
    });

    it('should throw NatifyError when getToken fails', async () => {
      const error = new Error('Get token failed');
      mockGetToken.mockRejectedValue(error);

      await expect(adapter.getToken()).rejects.toThrow(NatifyError);
      await expect(adapter.getToken()).rejects.toThrow('Error al obtener token de notificación');
    });
  });

  describe('deleteToken', () => {
    it('should delete token successfully', async () => {
      mockDeleteToken.mockResolvedValue(undefined);

      await adapter.deleteToken();

      expect(mockDeleteToken).toHaveBeenCalled();
    });

    it('should throw NatifyError when deleteToken fails', async () => {
      const error = new Error('Delete token failed');
      mockDeleteToken.mockRejectedValue(error);

      await expect(adapter.deleteToken()).rejects.toThrow(NatifyError);
      await expect(adapter.deleteToken()).rejects.toThrow('Error al eliminar token de notificación');
    });
  });

  describe('displayNotification', () => {
    it('should throw error indicating Notifee is needed', async () => {
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
      ).rejects.toThrow('Firebase Messaging no soporta notificaciones locales');
    });
  });

  describe('cancelNotification', () => {
    it('should throw error indicating Notifee is needed', async () => {
      await expect(adapter.cancelNotification('notification-id')).rejects.toThrow(NatifyError);
      await expect(adapter.cancelNotification('notification-id')).rejects.toThrow(
        'Firebase Messaging no soporta cancelar notificaciones locales',
      );
    });
  });

  describe('cancelAllNotifications', () => {
    it('should throw error indicating Notifee is needed', async () => {
      await expect(adapter.cancelAllNotifications()).rejects.toThrow(NatifyError);
      await expect(adapter.cancelAllNotifications()).rejects.toThrow(
        'Firebase Messaging no soporta cancelar notificaciones locales',
      );
    });
  });

  describe('getScheduledNotifications', () => {
    it('should throw error indicating Notifee is needed', async () => {
      await expect(adapter.getScheduledNotifications()).rejects.toThrow(NatifyError);
      await expect(adapter.getScheduledNotifications()).rejects.toThrow(
        'Firebase Messaging no soporta notificaciones programadas',
      );
    });
  });

  describe('onNotificationReceived', () => {
    it('should register and unregister listener', () => {
      const listener = jest.fn();
      const unsubscribe = adapter.onNotificationReceived(listener);

      expect(typeof unsubscribe).toBe('function');

      unsubscribe();
    });

    it('should call listener when Firebase message is received', async () => {
      const listener = jest.fn();
      adapter.onNotificationReceived(listener);

      // Simular mensaje de Firebase
      const messageHandler = mockOnMessage.mock.calls[mockOnMessage.mock.calls.length - 1][0];
      await messageHandler({
        notification: {
          title: 'Test',
          body: 'Test body',
        },
        data: {},
      });

      expect(listener).toHaveBeenCalled();
    });

    it('should call listener when Firebase message has no notification', async () => {
      const listener = jest.fn();
      adapter.onNotificationReceived(listener);

      // Simular mensaje de Firebase sin notification
      const messageHandler = mockOnMessage.mock.calls[mockOnMessage.mock.calls.length - 1][0];
      await messageHandler({
        data: {},
      });

      expect(listener).toHaveBeenCalled();
    });
  });

  describe('onNotificationPressed', () => {
    it('should register and unregister listener', () => {
      const listener = jest.fn();
      const unsubscribe = adapter.onNotificationPressed(listener);

      expect(typeof unsubscribe).toBe('function');

      unsubscribe();
    });

    it('should call listener when notification is opened from background', () => {
      const listener = jest.fn();
      adapter.onNotificationPressed(listener);

      // Simular notificación abierta desde background
      const backgroundHandler = mockOnNotificationOpenedApp.mock.calls[0][0];
      backgroundHandler({
        notification: {
          title: 'Test',
          body: 'Test body',
        },
        data: {},
      });

      expect(listener).toHaveBeenCalled();
    });

    it('should call listener when notification opened the app', async () => {
      const listener = jest.fn();

      // Configurar el mock antes de crear el adapter
      mockGetInitialNotification.mockResolvedValue({
        notification: {
          title: 'Test',
          body: 'Test body',
        },
        data: {},
      });

      // Crear nuevo adapter para que getInitialNotification se ejecute
      const newAdapter = new FirebasePushAdapter();
      newAdapter.onNotificationPressed(listener);

      // Esperar a que la promesa de getInitialNotification se resuelva
      await new Promise((resolve) => setTimeout(resolve, 50));

      // El listener debería haberse llamado
      expect(listener).toHaveBeenCalled();
    });
  });

  describe('onTokenRefresh', () => {
    it('should register and unregister listener', () => {
      const listener = jest.fn();
      const unsubscribe = adapter.onTokenRefresh(listener);

      expect(typeof unsubscribe).toBe('function');

      unsubscribe();
    });

    it('should call listener when token is refreshed', () => {
      require('react-native').Platform.OS = 'ios';
      const listener = jest.fn();
      const newAdapter = new FirebasePushAdapter();
      newAdapter.onTokenRefresh(listener);

      // Simular refresh de token
      const tokenHandler = mockOnTokenRefresh.mock.calls[mockOnTokenRefresh.mock.calls.length - 1][0];
      tokenHandler('new-token');

      expect(listener).toHaveBeenCalledWith({
        token: 'new-token',
        platform: 'ios',
      });
    });

    it('should call listener with android platform when on Android', () => {
      require('react-native').Platform.OS = 'android';
      const listener = jest.fn();
      const newAdapter = new FirebasePushAdapter();
      newAdapter.onTokenRefresh(listener);

      // Simular refresh de token
      const tokenHandler = mockOnTokenRefresh.mock.calls[mockOnTokenRefresh.mock.calls.length - 1][0];
      tokenHandler('new-token');

      expect(listener).toHaveBeenCalledWith({
        token: 'new-token',
        platform: 'android',
      });
    });
  });
});
