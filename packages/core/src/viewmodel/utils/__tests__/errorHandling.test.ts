import { toNativefyError } from '../errorHandling';
import { NativefyError, NativefyErrorCode } from '../../../errors';

describe('toNativefyError', () => {
  it('should return NativefyError as-is', () => {
    const nativefyError = new NativefyError(NativefyErrorCode.UNKNOWN, 'Test error');
    const result = toNativefyError(nativefyError);

    expect(result).toBe(nativefyError);
    expect(result).toBeInstanceOf(NativefyError);
  });

  it('should convert Error to NativefyError', () => {
    const error = new Error('Test error');
    const result = toNativefyError(error);

    expect(result).toBeInstanceOf(NativefyError);
    expect(result.message).toBe('Test error');
    expect(result.code).toBe(NativefyErrorCode.UNKNOWN);
    expect(result.originalError).toBe(error);
  });

  it('should convert unknown error to NativefyError', () => {
    const unknownError = 'String error';
    const result = toNativefyError(unknownError);

    expect(result).toBeInstanceOf(NativefyError);
    expect(result.message).toBe('Unknown error');
    expect(result.code).toBe(NativefyErrorCode.UNKNOWN);
    expect(result.originalError).toBe(unknownError);
  });

  it('should handle null/undefined errors', () => {
    const result1 = toNativefyError(null);
    const result2 = toNativefyError(undefined);

    expect(result1).toBeInstanceOf(NativefyError);
    expect(result1.message).toBe('Unknown error');
    expect(result2).toBeInstanceOf(NativefyError);
    expect(result2.message).toBe('Unknown error');
  });
});
