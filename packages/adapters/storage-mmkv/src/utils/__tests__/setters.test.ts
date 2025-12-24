import { setMMKVValue } from '../setters';
import { MMKV } from 'react-native-mmkv';

describe('setters', () => {
  let mockStorage: jest.Mocked<MMKV>;

  beforeEach(() => {
    mockStorage = {
      set: jest.fn(),
    } as any;
  });

  describe('setMMKVValue', () => {
    it('should set objects as JSON string', () => {
      const value = { key: 'value' };
      setMMKVValue(mockStorage, 'test-key', value);
      expect(mockStorage.set).toHaveBeenCalledWith('test-key', JSON.stringify(value));
    });

    it('should set strings directly', () => {
      const value = 'test string';
      setMMKVValue(mockStorage, 'test-key', value);
      expect(mockStorage.set).toHaveBeenCalledWith('test-key', value);
    });

    it('should set numbers directly', () => {
      const value = 123;
      setMMKVValue(mockStorage, 'test-key', value);
      expect(mockStorage.set).toHaveBeenCalledWith('test-key', value);
    });

    it('should set booleans directly', () => {
      setMMKVValue(mockStorage, 'test-key', true);
      expect(mockStorage.set).toHaveBeenCalledWith('test-key', true);

      setMMKVValue(mockStorage, 'test-key', false);
      expect(mockStorage.set).toHaveBeenCalledWith('test-key', false);
    });
  });
});

