import { NativefyError, NativefyErrorCode } from '../../errors';

/**
 * Convierte un error desconocido a NativefyError
 *
 * @param err - Error a convertir
 * @returns NativefyError
 */
export function toNativefyError(err: unknown): NativefyError {
  if (err instanceof NativefyError) {
    return err;
  }

  const errorMessage = err instanceof Error ? err.message : 'Unknown error';
  return new NativefyError(NativefyErrorCode.UNKNOWN, errorMessage, err);
}
