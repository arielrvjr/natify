import { toNatifyError } from '../errorHandling';
import { NatifyError, NatifyErrorCode } from '../../../errors';

describe('toNatifyError', () => {
  it('should return NatifyError as-is', () => {
    const natifyError = new NatifyError(NatifyErrorCode.UNKNOWN, 'Test error');
    const result = toNatifyError(natifyError);

    expect(result).toBe(natifyError);
    expect(result).toBeInstanceOf(NatifyError);
  });

  it('should convert Error to NatifyError', () => {
    const error = new Error('Test error');
    const result = toNatifyError(error);

    expect(result).toBeInstanceOf(NatifyError);
    expect(result.message).toBe('Test error');
    expect(result.code).toBe(NatifyErrorCode.UNKNOWN);
    expect(result.originalError).toBe(error);
  });

  it('should convert unknown error to NatifyError', () => {
    const unknownError = 'String error';
    const result = toNatifyError(unknownError);

    expect(result).toBeInstanceOf(NatifyError);
    expect(result.message).toBe('Unknown error');
    expect(result.code).toBe(NatifyErrorCode.UNKNOWN);
    expect(result.originalError).toBe(unknownError);
  });

  it('should handle null/undefined errors', () => {
    const result1 = toNatifyError(null);
    const result2 = toNatifyError(undefined);

    expect(result1).toBeInstanceOf(NatifyError);
    expect(result1.message).toBe('Unknown error');
    expect(result2).toBeInstanceOf(NatifyError);
    expect(result2.message).toBe('Unknown error');
  });
});
