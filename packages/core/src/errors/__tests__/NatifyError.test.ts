import { NatifyError, NatifyErrorCode } from '../index';

describe('NatifyError', () => {
  describe('constructor', () => {
    it('should create error with code and message', () => {
      const error = new NatifyError(NatifyErrorCode.NETWORK_ERROR, 'Network request failed');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(NatifyError);
      expect(error.code).toBe(NatifyErrorCode.NETWORK_ERROR);
      expect(error.message).toBe('Network request failed');
      expect(error.originalError).toBeUndefined();
      expect(error.context).toBeUndefined();
    });

    it('should create error with original error', () => {
      const originalError = new Error('Original error');
      const error = new NatifyError(
        NatifyErrorCode.NETWORK_ERROR,
        'Network request failed',
        originalError,
      );

      expect(error.originalError).toBe(originalError);
    });

    it('should create error with context', () => {
      const context = { url: '/api/users', method: 'GET' };
      const error = new NatifyError(
        NatifyErrorCode.NETWORK_ERROR,
        'Network request failed',
        undefined,
        context,
      );

      expect(error.context).toEqual(context);
    });

    it('should create error with all parameters', () => {
      const originalError = new Error('Original error');
      const context = { url: '/api/users', method: 'GET' };
      const error = new NatifyError(
        NatifyErrorCode.NETWORK_ERROR,
        'Network request failed',
        originalError,
        context,
      );

      expect(error.code).toBe(NatifyErrorCode.NETWORK_ERROR);
      expect(error.message).toBe('Network request failed');
      expect(error.originalError).toBe(originalError);
      expect(error.context).toEqual(context);
    });
  });

  describe('instanceof', () => {
    it('should work with instanceof Error', () => {
      const error = new NatifyError(NatifyErrorCode.NETWORK_ERROR, 'Network request failed');

      expect(error instanceof Error).toBe(true);
    });

    it('should work with instanceof NatifyError', () => {
      const error = new NatifyError(NatifyErrorCode.NETWORK_ERROR, 'Network request failed');

      expect(error instanceof NatifyError).toBe(true);
    });
  });

  describe('error codes', () => {
    it('should support all error codes', () => {
      const codes = [
        NatifyErrorCode.NETWORK_ERROR,
        NatifyErrorCode.TIMEOUT,
        NatifyErrorCode.UNAUTHORIZED,
        NatifyErrorCode.FORBIDDEN,
        NatifyErrorCode.NOT_FOUND,
        NatifyErrorCode.SERVER_ERROR,
        NatifyErrorCode.STORAGE_READ_ERROR,
        NatifyErrorCode.STORAGE_WRITE_ERROR,
        NatifyErrorCode.UNKNOWN,
        NatifyErrorCode.VALIDATION_ERROR,
      ];

      codes.forEach(code => {
        const error = new NatifyError(code, 'Test error');
        expect(error.code).toBe(code);
      });
    });
  });
});
