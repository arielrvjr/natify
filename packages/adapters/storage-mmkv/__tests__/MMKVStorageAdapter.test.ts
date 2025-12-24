import { MMKVStorageAdapter } from '../src';
import { createMMKV, MMKV } from 'react-native-mmkv';

// Mock react-native-mmkv
const mockStorage = {
  getString: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
  clearAll: jest.fn(),
};

jest.mock('react-native-mmkv', () => ({
  createMMKV: jest.fn(() => mockStorage),
}));

describe('MMKVStorageAdapter', () => {
  let adapter: MMKVStorageAdapter;

  beforeEach(() => {
    jest.clearAllMocks();
    adapter = new MMKVStorageAdapter();
  });

  describe('constructor', () => {
    it('should create adapter with default instanceId', () => {
      expect(adapter).toBeDefined();
      expect(adapter.capability).toBe('storage');
      expect(createMMKV).toHaveBeenCalledWith({ id: 'natify-storage' });
    });

    it('should create adapter with custom instanceId', () => {
      const customAdapter = new MMKVStorageAdapter('custom-storage');
      expect(customAdapter).toBeDefined();
      expect(createMMKV).toHaveBeenCalledWith({ id: 'custom-storage' });
    });
  });

  describe('getItem', () => {
    it('should return string value', async () => {
      mockStorage.getString.mockReturnValue('test-value');

      const value = await adapter.getItem<string>('test-key');

      expect(mockStorage.getString).toHaveBeenCalledWith('test-key');
      expect(value).toBe('test-value');
    });

    it('should return parsed JSON object', async () => {
      const jsonValue = { id: 1, name: 'Test' };
      mockStorage.getString.mockReturnValue(JSON.stringify(jsonValue));

      const value = await adapter.getItem<{ id: number; name: string }>('test-key');

      expect(value).toEqual(jsonValue);
    });

    it('should return null when key does not exist', async () => {
      mockStorage.getString.mockReturnValue(undefined);

      const value = await adapter.getItem('non-existent-key');

      expect(value).toBeNull();
    });

    it('should return string as-is if JSON parse fails', async () => {
      mockStorage.getString.mockReturnValue('not-json-string');

      const value = await adapter.getItem('test-key');

      expect(value).toBe('not-json-string');
    });
  });

  describe('setItem', () => {
    it('should set string value', async () => {
      await adapter.setItem('test-key', 'test-value');

      expect(mockStorage.set).toHaveBeenCalledWith('test-key', 'test-value');
    });

    it('should set object as JSON string', async () => {
      const objectValue = { id: 1, name: 'Test' };
      await adapter.setItem('test-key', objectValue);

      expect(mockStorage.set).toHaveBeenCalledWith('test-key', JSON.stringify(objectValue));
    });

    it('should set number value', async () => {
      await adapter.setItem('test-key', 123);

      expect(mockStorage.set).toHaveBeenCalledWith('test-key', 123);
    });

    it('should set boolean value', async () => {
      await adapter.setItem('test-key', true);

      expect(mockStorage.set).toHaveBeenCalledWith('test-key', true);
    });

    it('should set array as JSON string', async () => {
      const arrayValue = [1, 2, 3];
      await adapter.setItem('test-key', arrayValue);

      expect(mockStorage.set).toHaveBeenCalledWith('test-key', JSON.stringify(arrayValue));
    });
  });

  describe('removeItem', () => {
    it('should remove item', async () => {
      await adapter.removeItem('test-key');

      expect(mockStorage.remove).toHaveBeenCalledWith('test-key');
    });
  });

  describe('clear', () => {
    it('should clear all items', async () => {
      await adapter.clear();

      expect(mockStorage.clearAll).toHaveBeenCalled();
    });
  });
});

