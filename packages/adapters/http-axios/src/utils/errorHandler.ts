import axios from 'axios';
import { NatifyError, NatifyErrorCode } from '@natify/core';

/**
 * Maneja errores de Axios y los convierte a NatifyError
 */
export function handleAxiosError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;

    let code = NatifyErrorCode.NETWORK_ERROR;

    // Mapeo automático de códigos HTTP a NatifyErrorCode
    if (status === 401) code = NatifyErrorCode.UNAUTHORIZED;
    else if (status === 403) code = NatifyErrorCode.FORBIDDEN;
    else if (status === 404) code = NatifyErrorCode.NOT_FOUND;
    else if (status && status >= 500) code = NatifyErrorCode.SERVER_ERROR;
    else if (error.code === 'ECONNABORTED') code = NatifyErrorCode.TIMEOUT;

    throw new NatifyError(code, error.message, error, {
      url: error.config?.url,
      method: error.config?.method,
    });
  }

  throw new NatifyError(
    NatifyErrorCode.UNKNOWN,
    (error as Error).message || 'Unknown error occurred',
    error,
  );
}
