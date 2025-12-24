const mockSetGenericPassword = jest.fn();
const mockGetGenericPassword = jest.fn();
const mockResetGenericPassword = jest.fn();

jest.mock('react-native-keychain', () => ({
  __esModule: true,
  default: {
    setGenericPassword: mockSetGenericPassword,
    getGenericPassword: mockGetGenericPassword,
    resetGenericPassword: mockResetGenericPassword,
    ACCESSIBLE: {
      WHEN_UNLOCKED: 'WHEN_UNLOCKED',
    },
  },
}));

import { KeychainStorageAdapter } from '../src';
import Keychain from 'react-native-keychain';

describe('KeychainStorageAdapter', () => {
  let adapter: KeychainStorageAdapter;

  beforeEach(() => {
    jest.clearAllMocks();
    adapter = new KeychainStorageAdapter();
  });

  describe('capability', () => {
    it('should have correct capability', () => {
      expect(adapter.capability).toBe('storage');
    });
  });

  describe('setItem', () => {
    it('should set string value', async () => {
      mockSetGenericPassword.mockResolvedValue({
        service: 'test-key',
        username: 'test-key',
        password: 'test-value',
      });

      await adapter.setItem('test-key', 'test-value');

      expect(mockSetGenericPassword).toHaveBeenCalledWith(
        'test-key',
        'test-value',
        {
          service: 'test-key',
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
        },
      );
    });

    it('should set number value', async () => {
      mockSetGenericPassword.mockResolvedValue({
        service: 'test-key',
        username: 'test-key',
        password: '123',
      });

      await adapter.setItem('test-key', 123);

      expect(mockSetGenericPassword).toHaveBeenCalledWith(
        'test-key',
        '123',
        {
          service: 'test-key',
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
        },
      );
    });

    it('should set boolean value', async () => {
      mockSetGenericPassword.mockResolvedValue({
        service: 'test-key',
        username: 'test-key',
        password: 'true',
      });

      await adapter.setItem('test-key', true);

      expect(mockSetGenericPassword).toHaveBeenCalledWith(
        'test-key',
        'true',
        {
          service: 'test-key',
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
        },
      );
    });

    it('should set object value as JSON string', async () => {
      const value = { name: 'test', age: 30 };
      mockSetGenericPassword.mockResolvedValue({
        service: 'test-key',
        username: 'test-key',
        password: JSON.stringify(value),
      });

      await adapter.setItem('test-key', value);

      expect(mockSetGenericPassword).toHaveBeenCalledWith(
        'test-key',
        JSON.stringify(value),
        {
          service: 'test-key',
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
        },
      );
    });

    it('should throw error when setGenericPassword returns false', async () => {
      mockSetGenericPassword.mockResolvedValue(false);

      await expect(adapter.setItem('test-key', 'test-value')).rejects.toThrow(
        '[KeychainStorageAdapter] Failed to set item with key "test-key"',
      );
    });
  });

  describe('getItem', () => {
    it('should return string value', async () => {
      mockGetGenericPassword.mockResolvedValue({
        service: 'test-key',
        username: 'test-key',
        password: 'test-value',
      });

      const result = await adapter.getItem<string>('test-key');

      expect(result).toBe('test-value');
      expect(mockGetGenericPassword).toHaveBeenCalledWith({
        service: 'test-key',
      });
    });

    it('should return parsed JSON object', async () => {
      const value = { name: 'test', age: 30 };
      mockGetGenericPassword.mockResolvedValue({
        service: 'test-key',
        username: 'test-key',
        password: JSON.stringify(value),
      });

      const result = await adapter.getItem<typeof value>('test-key');

      expect(result).toEqual(value);
    });

    it('should return null when credentials not found', async () => {
      mockGetGenericPassword.mockResolvedValue(false);

      const result = await adapter.getItem('test-key');

      expect(result).toBeNull();
    });

    it('should return string value when JSON parse fails', async () => {
      mockGetGenericPassword.mockResolvedValue({
        service: 'test-key',
        username: 'test-key',
        password: 'not-json-string',
      });

      const result = await adapter.getItem<string>('test-key');

      expect(result).toBe('not-json-string');
    });
  });

  describe('removeItem', () => {
    it('should remove item successfully', async () => {
      mockResetGenericPassword.mockResolvedValue(true);

      await adapter.removeItem('test-key');

      expect(mockResetGenericPassword).toHaveBeenCalledWith({
        service: 'test-key',
      });
    });

    it('should throw error when resetGenericPassword returns false', async () => {
      mockResetGenericPassword.mockResolvedValue(false);

      await expect(adapter.removeItem('test-key')).rejects.toThrow(
        '[KeychainStorageAdapter] Failed to remove item with key "test-key"',
      );
    });
  });

  describe('clear', () => {
    it('should clear all items successfully', async () => {
      mockResetGenericPassword.mockResolvedValue(true);

      await adapter.clear();

      expect(mockResetGenericPassword).toHaveBeenCalledWith();
    });

    it('should throw error when resetGenericPassword returns false', async () => {
      mockResetGenericPassword.mockResolvedValue(false);

      await expect(adapter.clear()).rejects.toThrow(
        '[KeychainStorageAdapter] Failed to clear storage',
      );
    });
  });
});
