import { AsyncStorageAdapter } from '../src';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

const mockedAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('AsyncStorageAdapter', () => {
  let adapter: AsyncStorageAdapter;

  beforeEach(() => {
    jest.clearAllMocks();
    adapter = new AsyncStorageAdapter();
  });

  describe('constructor', () => {
    it('should create adapter', () => {
      expect(adapter).toBeDefined();
      expect(adapter.capability).toBe('storage');
    });
  });

  describe('getItem', () => {
    it('should return string value', async () => {
      mockedAsyncStorage.getItem.mockResolvedValue('test-value');

      const value = await adapter.getItem<string>('test-key');

      expect(mockedAsyncStorage.getItem).toHaveBeenCalledWith('test-key');
      expect(value).toBe('test-value');
    });

    it('should return parsed JSON object', async () => {
      const jsonValue = { id: 1, name: 'Test' };
      mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(jsonValue));

      const value = await adapter.getItem<{ id: number; name: string }>('test-key');

      expect(value).toEqual(jsonValue);
    });

    it('should return null when key does not exist', async () => {
      mockedAsyncStorage.getItem.mockResolvedValue(null);

      const value = await adapter.getItem('non-existent-key');

      expect(value).toBeNull();
    });

    it('should return string as-is if JSON parse fails', async () => {
      mockedAsyncStorage.getItem.mockResolvedValue('not-json-string');

      const value = await adapter.getItem('test-key');

      expect(value).toBe('not-json-string');
    });
  });

  describe('setItem', () => {
    it('should set string value', async () => {
      await adapter.setItem('test-key', 'test-value');

      expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith('test-key', 'test-value');
    });

    it('should set object as JSON string', async () => {
      const objectValue = { id: 1, name: 'Test' };
      await adapter.setItem('test-key', objectValue);

      expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(
        'test-key',
        JSON.stringify(objectValue),
      );
    });

    it('should set number as string', async () => {
      await adapter.setItem('test-key', 123);

      expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith('test-key', '123');
    });

    it('should set boolean as string', async () => {
      await adapter.setItem('test-key', true);

      expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith('test-key', 'true');
    });

    it('should set array as JSON string', async () => {
      const arrayValue = [1, 2, 3];
      await adapter.setItem('test-key', arrayValue);

      expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(
        'test-key',
        JSON.stringify(arrayValue),
      );
    });
  });

  describe('removeItem', () => {
    it('should remove item', async () => {
      await adapter.removeItem('test-key');

      expect(mockedAsyncStorage.removeItem).toHaveBeenCalledWith('test-key');
    });
  });

  describe('clear', () => {
    it('should clear all items', async () => {
      await adapter.clear();

      expect(mockedAsyncStorage.clear).toHaveBeenCalled();
    });
  });
});

