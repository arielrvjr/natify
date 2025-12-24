import { NatifyError, NatifyErrorCode } from '../../errors';

/**
 * Convierte un error desconocido a NatifyError
 *
 * @param err - Error a convertir
 * @returns NatifyError
 */
export function toNatifyError(err: unknown): NatifyError {
  if (err instanceof NatifyError) {
    return err;
  }

  const errorMessage = err instanceof Error ? err.message : 'Unknown error';
  return new NatifyError(NatifyErrorCode.UNKNOWN, errorMessage, err);
}
