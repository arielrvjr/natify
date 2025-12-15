// packages/core/src/errors/index.ts

export enum NativefyErrorCode {
  // Red
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  UNAUTHORIZED = 'UNAUTHORIZED', // 401
  FORBIDDEN = 'FORBIDDEN', // 403
  NOT_FOUND = 'NOT_FOUND', // 404
  SERVER_ERROR = 'SERVER_ERROR', // 500+

  // Storage
  STORAGE_READ_ERROR = 'STORAGE_READ_ERROR',
  STORAGE_WRITE_ERROR = 'STORAGE_WRITE_ERROR',

  // General
  UNKNOWN = 'UNKNOWN',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

export class NativefyError extends Error {
  public readonly code: NativefyErrorCode;
  public readonly originalError?: unknown;
  public readonly context?: Record<string, any>;

  constructor(
    code: NativefyErrorCode,
    message: string,
    originalError?: unknown,
    context?: Record<string, any>,
  ) {
    super(message);
    this.code = code;
    this.originalError = originalError;
    this.context = context;

    // Necesario para que instanceof funcione en ES5/ES6
    Object.setPrototypeOf(this, NativefyError.prototype);
  }
}
