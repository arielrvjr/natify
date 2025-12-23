import { NativefyError, NativefyErrorCode } from '../src/errors';

describe('NativefyError', () => {
  describe('constructor', () => {
    it('should create error with code and message', () => {
      const error = new NativefyError(
        NativefyErrorCode.NETWORK_ERROR,
        'Network request failed',
      );

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(NativefyError);
      expect(error.code).toBe(NativefyErrorCode.NETWORK_ERROR);
      expect(error.message).toBe('Network request failed');
      expect(error.originalError).toBeUndefined();
      expect(error.context).toBeUndefined();
    });

    it('should create error with original error', () => {
      const originalError = new Error('Original error');
      const error = new NativefyError(
        NativefyErrorCode.NETWORK_ERROR,
        'Network request failed',
        originalError,
      );

      expect(error.originalError).toBe(originalError);
    });

    it('should create error with context', () => {
      const context = { url: '/api/users', method: 'GET' };
      const error = new NativefyError(
        NativefyErrorCode.NETWORK_ERROR,
        'Network request failed',
        undefined,
        context,
      );

      expect(error.context).toEqual(context);
    });

    it('should create error with all parameters', () => {
      const originalError = new Error('Original error');
      const context = { url: '/api/users', method: 'GET' };
      const error = new NativefyError(
        NativefyErrorCode.NETWORK_ERROR,
        'Network request failed',
        originalError,
        context,
      );

      expect(error.code).toBe(NativefyErrorCode.NETWORK_ERROR);
      expect(error.message).toBe('Network request failed');
      expect(error.originalError).toBe(originalError);
      expect(error.context).toEqual(context);
    });
  });

  describe('instanceof', () => {
    it('should work with instanceof Error', () => {
      const error = new NativefyError(
        NativefyErrorCode.NETWORK_ERROR,
        'Network request failed',
      );

      expect(error instanceof Error).toBe(true);
    });

    it('should work with instanceof NativefyError', () => {
      const error = new NativefyError(
        NativefyErrorCode.NETWORK_ERROR,
        'Network request failed',
      );

      expect(error instanceof NativefyError).toBe(true);
    });
  });

  describe('error codes', () => {
    it('should support all error codes', () => {
      const codes = [
        NativefyErrorCode.NETWORK_ERROR,
        NativefyErrorCode.TIMEOUT,
        NativefyErrorCode.UNAUTHORIZED,
        NativefyErrorCode.FORBIDDEN,
        NativefyErrorCode.NOT_FOUND,
        NativefyErrorCode.SERVER_ERROR,
        NativefyErrorCode.STORAGE_READ_ERROR,
        NativefyErrorCode.STORAGE_WRITE_ERROR,
        NativefyErrorCode.UNKNOWN,
        NativefyErrorCode.VALIDATION_ERROR,
      ];

      codes.forEach(code => {
        const error = new NativefyError(code, 'Test error');
        expect(error.code).toBe(code);
      });
    });
  });
});

