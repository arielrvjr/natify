import { toRadians, toDegrees } from '../mathUtils';

describe('mathUtils', () => {
  describe('toRadians', () => {
    it('should convert degrees to radians correctly', () => {
      expect(toRadians(0)).toBe(0);
      expect(toRadians(90)).toBeCloseTo(Math.PI / 2);
      expect(toRadians(180)).toBeCloseTo(Math.PI);
      expect(toRadians(360)).toBeCloseTo(2 * Math.PI);
    });

    it('should handle negative degrees', () => {
      expect(toRadians(-90)).toBeCloseTo(-Math.PI / 2);
    });
  });

  describe('toDegrees', () => {
    it('should convert radians to degrees correctly', () => {
      expect(toDegrees(0)).toBe(0);
      expect(toDegrees(Math.PI / 2)).toBeCloseTo(90);
      expect(toDegrees(Math.PI)).toBeCloseTo(180);
      expect(toDegrees(2 * Math.PI)).toBeCloseTo(360);
    });

    it('should handle negative radians', () => {
      expect(toDegrees(-Math.PI / 2)).toBeCloseTo(-90);
    });
  });

  describe('round-trip conversion', () => {
    it('should convert degrees to radians and back correctly', () => {
      const degrees = 45;
      const radians = toRadians(degrees);
      const backToDegrees = toDegrees(radians);
      expect(backToDegrees).toBeCloseTo(degrees);
    });
  });
});
