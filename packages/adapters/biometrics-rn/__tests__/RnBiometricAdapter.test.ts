import { RnBiometricAdapter } from '../src';
import { BiometryType } from '@nativefy/core';

const mockIsSensorAvailable = jest.fn();
const mockSimplePrompt = jest.fn();

jest.mock('react-native-biometrics', () => {
  const MockedClass = jest.fn().mockImplementation(() => ({
    isSensorAvailable: mockIsSensorAvailable,
    simplePrompt: mockSimplePrompt,
  }));
  return MockedClass;
});

describe('RnBiometricAdapter', () => {
  let adapter: RnBiometricAdapter;

  beforeEach(() => {
    jest.clearAllMocks();
    adapter = new RnBiometricAdapter();
  });

  describe('capability', () => {
    it('should have correct capability', () => {
      expect(adapter.capability).toBe('biometrics');
    });
  });

  describe('isAvailable', () => {
    it('should return true when sensor is available', async () => {
      mockIsSensorAvailable.mockResolvedValue({
        available: true,
        biometryType: 'FaceID',
      });

      const result = await adapter.isAvailable();

      expect(result).toBe(true);
      expect(mockIsSensorAvailable).toHaveBeenCalled();
    });

    it('should return false when sensor is not available', async () => {
      mockIsSensorAvailable.mockResolvedValue({
        available: false,
        biometryType: 'None',
      });

      const result = await adapter.isAvailable();

      expect(result).toBe(false);
    });

    it('should return false when error occurs', async () => {
      mockIsSensorAvailable.mockRejectedValue(new Error('Sensor error'));

      const result = await adapter.isAvailable();

      expect(result).toBe(false);
    });
  });

  describe('getBiometryType', () => {
    it('should return FaceID for FaceID biometry', async () => {
      mockIsSensorAvailable.mockResolvedValue({
        available: true,
        biometryType: 'FaceID',
      });

      const result = await adapter.getBiometryType();

      expect(result).toBe(BiometryType.FaceID);
    });

    it('should return Fingerprint for TouchID biometry', async () => {
      mockIsSensorAvailable.mockResolvedValue({
        available: true,
        biometryType: 'TouchID',
      });

      const result = await adapter.getBiometryType();

      expect(result).toBe(BiometryType.Fingerprint);
    });

    it('should return Fingerprint for Biometrics biometry', async () => {
      mockIsSensorAvailable.mockResolvedValue({
        available: true,
        biometryType: 'Biometrics',
      });

      const result = await adapter.getBiometryType();

      expect(result).toBe(BiometryType.Fingerprint);
    });

    it('should return None for other biometry types', async () => {
      mockIsSensorAvailable.mockResolvedValue({
        available: false,
        biometryType: 'None',
      });

      const result = await adapter.getBiometryType();

      expect(result).toBe(BiometryType.None);
    });
  });

  describe('authenticate', () => {
    it('should return success when authentication succeeds', async () => {
      mockSimplePrompt.mockResolvedValue({
        success: true,
      });

      const result = await adapter.authenticate('Please authenticate');

      expect(result).toEqual({ success: true });
      expect(mockSimplePrompt).toHaveBeenCalledWith({
        promptMessage: 'Please authenticate',
      });
    });

    it('should return failure with error message when authentication fails', async () => {
      const error = new Error('Authentication failed');
      mockSimplePrompt.mockRejectedValue(error);

      const result = await adapter.authenticate('Please authenticate');

      expect(result).toEqual({ success: false, error: 'Authentication failed' });
    });

    it('should return failure when authentication is cancelled', async () => {
      mockSimplePrompt.mockResolvedValue({
        success: false,
      });

      const result = await adapter.authenticate('Please authenticate');

      expect(result).toEqual({ success: false });
    });
  });
});

