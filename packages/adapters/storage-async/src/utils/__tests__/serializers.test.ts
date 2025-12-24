import { serializeValue } from '../serializers';

describe('serializers', () => {
  describe('serializeValue', () => {
    it('should serialize objects to JSON', () => {
      const value = { key: 'value', number: 123 };
      const result = serializeValue(value);
      expect(result).toBe(JSON.stringify(value));
    });

    it('should serialize strings as-is', () => {
      const value = 'test string';
      const result = serializeValue(value);
      expect(result).toBe('test string');
    });

    it('should serialize numbers to string', () => {
      const value = 123;
      const result = serializeValue(value);
      expect(result).toBe('123');
    });

    it('should serialize booleans to string', () => {
      expect(serializeValue(true)).toBe('true');
      expect(serializeValue(false)).toBe('false');
    });

    it('should handle null and undefined', () => {
      expect(serializeValue(null)).toBe('null');
      expect(serializeValue(undefined)).toBe('undefined');
    });

    it('should handle arrays', () => {
      const value = [1, 2, 3];
      const result = serializeValue(value);
      expect(result).toBe(JSON.stringify(value));
    });
  });
});

